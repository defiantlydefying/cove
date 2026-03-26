import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const modules = await prisma.moduleSetting.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(modules);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.moduleId || typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "moduleId and enabled are required" },
      { status: 400 }
    );
  }

  const moduleSetting = await prisma.moduleSetting.upsert({
    where: {
      userId_moduleId: {
        userId: session.user.id,
        moduleId: body.moduleId,
      },
    },
    update: { enabled: body.enabled },
    create: {
      userId: session.user.id,
      moduleId: body.moduleId,
      enabled: body.enabled,
    },
  });

  return NextResponse.json(moduleSetting);
}
