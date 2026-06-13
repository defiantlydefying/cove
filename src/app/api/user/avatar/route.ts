import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AVATARS, getRandomStarterKey } from "@/lib/avatars";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarKey: true },
  });

  const streak = await prisma.userStreak.findFirst({
    where: { userId: session.user.id, type: "daily" },
    select: { totalXp: true },
  });

  const xp = streak?.totalXp ?? 0;
  const unlocked = AVATARS.filter((a) => {
    if (a.unlockType === "default") return true;
    if (a.unlockType === "xp" && a.unlockThreshold && xp >= a.unlockThreshold) return true;
    return false;
  });

  return NextResponse.json({
    current: user?.avatarKey ?? null,
    unlocked,
    totalAvailable: AVATARS.length,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.regenerate) {
    const newKey = getRandomStarterKey();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarKey: newKey },
    });
    return NextResponse.json({ avatarKey: newKey });
  }

  const key = body.avatarKey;
  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "avatarKey is required" }, { status: 400 });
  }

  const avatar = AVATARS.find((a) => a.key === key);
  if (!avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  if (avatar.unlockType === "xp" && avatar.unlockThreshold) {
    const streak = await prisma.userStreak.findFirst({
      where: { userId: session.user.id, type: "daily" },
      select: { totalXp: true },
    });
    if ((streak?.totalXp ?? 0) < avatar.unlockThreshold) {
      return NextResponse.json({ error: "Avatar not yet unlocked" }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarKey: key },
  });

  return NextResponse.json({ avatarKey: key });
}
