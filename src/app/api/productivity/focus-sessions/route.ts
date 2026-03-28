import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const days = parseInt(req.nextUrl.searchParams.get("days") || "7", 10);
  const since = new Date(Date.now() - days * 86400000);

  const sessions = await prisma.focusSession.findMany({
    where: { userId: user.id, completedAt: { gte: since } },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { label, taskId, durationMin, sessionType } = body;

  const created = await prisma.focusSession.create({
    data: {
      userId: user.id,
      label: label || null,
      taskId: taskId || null,
      durationMin: durationMin || 25,
      sessionType: sessionType || "focus",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
