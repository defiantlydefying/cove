import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isCanonicalModuleId } from "@/lib/modules/ids";

const THEMES = new Set(["light", "dark"]);
const DENSITIES = new Set(["compact", "comfortable", "spacious"]);
const COMPANIONS = new Set(["otter", "turtle", "seal", "owl", "fox", "deer", "frog"]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const modules = body?.modules;
  const settings = body?.settings;
  const profile = body?.profile;
  const moduleEntries =
    modules && typeof modules === "object" && !Array.isArray(modules)
      ? Object.entries(modules)
      : [];

  const validModules =
    moduleEntries.length > 0 &&
    moduleEntries.every(
      ([moduleId, enabled]) => isCanonicalModuleId(moduleId) && typeof enabled === "boolean"
    );
  const validSettings =
    settings &&
    THEMES.has(settings.theme) &&
    DENSITIES.has(settings.density) &&
    typeof settings.animationsOn === "boolean" &&
    COMPANIONS.has(settings.companionType);
  const validAge =
    profile?.age === null ||
    (Number.isInteger(profile?.age) && profile.age >= 13 && profile.age <= 120);
  const validProfile =
    profile &&
    validAge &&
    isStringArray(profile.conditions) &&
    isStringArray(profile.medications) &&
    (profile.notes === null || typeof profile.notes === "string");

  if (!validModules || !validSettings || !validProfile) {
    return NextResponse.json({ error: "Invalid onboarding settings" }, { status: 400 });
  }

  const userId = session.user.id;
  const settingsData = {
    theme: settings.theme as string,
    density: settings.density as string,
    animationsOn: settings.animationsOn as boolean,
    companionType: settings.companionType as string,
    companionChosen: true,
  };
  const profileData = {
    age: profile.age as number | null,
    conditions: profile.conditions as string[],
    medications: profile.medications as string[],
    notes: profile.notes as string | null,
  };

  try {
    await prisma.$transaction([
      ...moduleEntries.map(([moduleId, enabled]) =>
        prisma.moduleSetting.upsert({
          where: { userId_moduleId: { userId, moduleId } },
          update: { enabled: enabled as boolean },
          create: { userId, moduleId, enabled: enabled as boolean },
        })
      ),
      prisma.userSettings.upsert({
        where: { userId },
        update: settingsData,
        create: { userId, ...settingsData },
      }),
      prisma.userProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to save onboarding setup", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
