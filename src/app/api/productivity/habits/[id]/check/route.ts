import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id: habitId } = await params;

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id } });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const dateStr = body.date || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr);

  // Check if already checked today
  const existing = await prisma.habitCheck.findUnique({
    where: { habitId_date: { habitId, date } },
  });

  if (existing) {
    // Uncheck
    await prisma.habitCheck.delete({ where: { id: existing.id } });
  } else {
    // Check
    await prisma.habitCheck.create({ data: { habitId, date } });
  }

  // Recalculate streak
  let streak = 0;
  const checkDate = new Date(new Date().toISOString().split("T")[0]);
  while (true) {
    const check = await prisma.habitCheck.findUnique({
      where: { habitId_date: { habitId, date: checkDate } },
    });
    if (!check) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const longestStreak = Math.max(streak, habit.longestStreak);

  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak: streak, longestStreak },
  });

  // Update linked weekly goals
  const monday = getMonday();
  const linkedGoals = await prisma.weeklyGoal.findMany({
    where: { linkedHabitId: habitId, weekStart: monday },
  });

  for (const goal of linkedGoals) {
    const count = await prisma.habitCheck.count({
      where: { habitId, date: { gte: monday } },
    });
    await prisma.weeklyGoal.update({
      where: { id: goal.id },
      data: { currentCount: count },
    });
  }

  // Return updated habit with checks
  const updated = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      checks: {
        where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
        orderBy: { date: "desc" },
      },
    },
  });

  return NextResponse.json(updated);
}

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
