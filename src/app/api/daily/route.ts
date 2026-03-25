import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [tasks, routines, wellness, reminders] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        completed: false,
        parentId: null,
      },
      orderBy: [{ priority: "desc" }, { sortOrder: "asc" }],
      take: 10,
    }),

    prisma.routine.findMany({
      where: { userId, isActive: true },
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        logs: {
          where: { date: today },
          take: 1,
        },
      },
      orderBy: { sortOrder: "asc" },
    }),

    prisma.wellnessCheckin.findFirst({
      where: { userId, date: today },
    }),

    prisma.reminder.findMany({
      where: {
        userId,
        enabled: true,
        OR: [
          { snoozedUntil: null },
          { snoozedUntil: { lt: new Date() } },
        ],
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    tasks,
    routines,
    wellness: wellness ?? null,
    reminders,
  });
}
