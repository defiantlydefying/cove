import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const monday = getMonday();

  const goals = await prisma.weeklyGoal.findMany({
    where: { userId: user.id, weekStart: monday },
    include: { linkedHabit: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { title, targetCount, linkedHabitId } = await req.json();
  const monday = getMonday();

  let currentCount = 0;
  if (linkedHabitId) {
    const checks = await prisma.habitCheck.count({
      where: { habitId: linkedHabitId, date: { gte: monday } },
    });
    currentCount = checks;
  }

  const created = await prisma.weeklyGoal.create({
    data: {
      userId: user.id,
      title,
      targetCount,
      currentCount,
      weekStart: monday,
      linkedHabitId: linkedHabitId || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id, ...updates } = await req.json();

  const goal = await prisma.weeklyGoal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.weeklyGoal.update({ where: { id }, data: updates });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await req.json();

  const goal = await prisma.weeklyGoal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weeklyGoal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
