import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_TYPES = ["tasks", "routines", "wellness"] as const;
type ActivityType = (typeof VALID_TYPES)[number];

const XP_PER_ACTIVITY = 10;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    startOfDay(date).getTime() === startOfDay(yesterday).getTime()
  );
}

function isToday(date: Date, now: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(now).getTime();
}

async function upsertStreak(userId: string, type: string, now: Date) {
  const existing = await prisma.userStreak.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!existing) {
    return prisma.userStreak.create({
      data: {
        userId,
        type,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveAt: now,
        pausedAt: null,
        totalXp: XP_PER_ACTIVITY,
      },
    });
  }

  // Already recorded today -- no change
  if (existing.lastActiveAt && isToday(existing.lastActiveAt, now)) {
    return existing;
  }

  let newCurrent: number;

  if (existing.lastActiveAt && isYesterday(existing.lastActiveAt, now)) {
    // Continuing streak from yesterday
    newCurrent = existing.currentStreak + 1;
  } else {
    // Streak was paused (gap > 1 day) -- resume from 1, don't punish
    newCurrent = 1;
  }

  const newLongest = Math.max(existing.longestStreak, newCurrent);

  return prisma.userStreak.update({
    where: { id: existing.id },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveAt: now,
      pausedAt: null,
      totalXp: existing.totalXp + XP_PER_ACTIVITY,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.type || !VALID_TYPES.includes(body.type as ActivityType)) {
    return NextResponse.json(
      { error: "Invalid type. Must be one of: tasks, routines, wellness" },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const now = new Date();
  const type = body.type as ActivityType;

  // Update the specific activity streak
  const streak = await upsertStreak(userId, type, now);

  // Also update the "daily" streak (any activity counts)
  const dailyStreak = await upsertStreak(userId, "daily", now);

  return NextResponse.json({ streak, dailyStreak });
}
