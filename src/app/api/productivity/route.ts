import { NextResponse } from "next/server";
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

  const today = new Date(new Date().toISOString().split("T")[0]);
  const monday = getMonday();

  const [focusSessions, weekSessions, plannerItems, habits, weeklyGoals, timeEntries] =
    await Promise.all([
      prisma.focusSession.findMany({
        where: { userId: user.id, completedAt: { gte: today } },
        orderBy: { completedAt: "desc" },
      }),
      prisma.focusSession.findMany({
        where: { userId: user.id, completedAt: { gte: monday } },
        orderBy: { completedAt: "desc" },
      }),
      prisma.plannerItem.findMany({
        where: { userId: user.id, date: today },
        orderBy: [{ zone: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.habit.findMany({
        where: { userId: user.id },
        include: {
          checks: {
            where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
            orderBy: { date: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.weeklyGoal.findMany({
        where: { userId: user.id, weekStart: monday },
        include: { linkedHabit: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.timeEntry.findMany({
        where: { userId: user.id, date: { gte: monday } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
    ]);

  return NextResponse.json({
    focusSessions,
    weekSessions,
    plannerItems,
    habits,
    weeklyGoals,
    timeEntries,
  });
}
