import { prisma } from "@/lib/db";

const XP_PER_ACTIVITY = 10;

export type ActivityType = "tasks" | "routines" | "wellness" | "focus" | "habits";

// Derive the calendar day in UTC. DailyActivity.date is a date-only column
// (`@db.Date`) that Prisma reads back as UTC midnight, so keying days in UTC
// keeps writes, reads, and today/yesterday comparisons aligned regardless of
// the server's timezone. Using local hours here shifts DB-loaded dates by a
// day on any non-UTC server (e.g. local dev), silently breaking streaks.
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(date).getTime() === startOfDay(yesterday).getTime();
}

function isToday(date: Date, now: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(now).getTime();
}

function dateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

/**
 * Record that the user had activity of a given type today in DailyActivity.
 * Idempotent: adds the type to the array if not already present.
 */
async function recordDailyActivity(userId: string, type: ActivityType, now: Date) {
  const date = startOfDay(now);
  const existing = await prisma.dailyActivity.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (!existing) {
    return prisma.dailyActivity.create({
      data: { userId, date, activityTypes: [type] },
    });
  }

  if (existing.activityTypes.includes(type)) {
    return existing;
  }

  return prisma.dailyActivity.update({
    where: { id: existing.id },
    data: { activityTypes: [...existing.activityTypes, type] },
  });
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

  if (existing.lastActiveAt && isToday(existing.lastActiveAt, now)) {
    return existing;
  }

  let newCurrent: number;
  if (existing.lastActiveAt && isYesterday(existing.lastActiveAt, now)) {
    newCurrent = existing.currentStreak + 1;
  } else {
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

/**
 * Record a gamification activity for a user.
 * Updates the specific type streak + the daily meta-streak, records activity
 * in DailyActivity for history tracking, and awards any unlocked achievements.
 */
export async function recordActivity(userId: string, type: string) {
  const now = new Date();
  const streak = await upsertStreak(userId, type, now);
  const dailyStreak = await upsertStreak(userId, "daily", now);
  await recordDailyActivity(userId, type as ActivityType, now);
  const newAchievements = await checkAchievements(userId);
  return { streak, dailyStreak, xpEarned: XP_PER_ACTIVITY, newAchievements };
}

/**
 * Compute the consecutive-day streak from a set of active date keys,
 * anchored to today. Counts today if present, otherwise counts backwards
 * from yesterday. Returns 0 if neither today nor yesterday had activity.
 */
export function computeStreakFromDates(activeKeys: Set<string>, now = new Date()): number {
  const todayKey = dateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  // If neither today nor yesterday had activity, streak is broken
  if (!activeKeys.has(todayKey) && !activeKeys.has(yesterdayKey)) return 0;

  let streak = 0;
  const cursor = new Date(now);
  // If today isn't active but yesterday is, start from yesterday
  if (!activeKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeKeys.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Returns the 7 days of the current week (Mon-Sun) with ISO date strings.
 */
export function getCurrentWeekDays(now = new Date()): string[] {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0 Sun, 1 Mon, ..., 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setUTCDate(monday.getUTCDate() + i);
    days.push(dateKey(dd));
  }
  return days;
}

/**
 * Fetch the user's DailyActivity history for the last N days and return
 * per-type active date sets plus an "any activity" set.
 */
export async function getActivityHistory(userId: string, daysBack = 60) {
  const now = new Date();
  const start = startOfDay(now);
  start.setDate(start.getDate() - daysBack);

  const rows = await prisma.dailyActivity.findMany({
    where: { userId, date: { gte: start } },
    orderBy: { date: "asc" },
  });

  const any = new Set<string>();
  const byType: Record<ActivityType, Set<string>> = {
    tasks: new Set(),
    routines: new Set(),
    wellness: new Set(),
    focus: new Set(),
    habits: new Set(),
  };

  for (const row of rows) {
    const key = dateKey(row.date);
    any.add(key);
    for (const t of row.activityTypes) {
      if (t in byType) byType[t as ActivityType].add(key);
    }
  }

  return { any, byType };
}

/**
 * Check all milestones and award any unlocked achievements.
 */
async function checkAchievements(userId: string) {
  const [streaks, existingAchievements, achievements] = await Promise.all([
    prisma.userStreak.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    prisma.achievement.findMany(),
  ]);

  if (achievements.length === 0) return [];

  const unlockedIds = new Set(existingAchievements.map((a) => a.achievementId));
  const streakMap = new Map(streaks.map((s) => [s.type, s]));

  const totalXp = streaks.reduce((sum, s) => sum + s.totalXp, 0);
  const dailyStreak = streakMap.get("daily")?.currentStreak || 0;
  const longestDaily = streakMap.get("daily")?.longestStreak || 0;
  const taskStreak = streakMap.get("tasks")?.currentStreak || 0;
  const taskTotal = streakMap.get("tasks")?.totalXp || 0; // proxy for total task completions
  const focusTotal = streakMap.get("focus")?.totalXp || 0;
  const habitsStreak = streakMap.get("habits")?.currentStreak || 0;
  const wellnessStreak = streakMap.get("wellness")?.currentStreak || 0;
  const routinesStreak = streakMap.get("routines")?.currentStreak || 0;

  // Count focus sessions and habit checks for milestone checks
  const [focusCount, habitCheckCount] = await Promise.all([
    prisma.focusSession.count({ where: { userId, sessionType: "focus" } }),
    prisma.habitCheck.count({ where: { habit: { userId } } }),
  ]);

  const checks: Record<string, boolean> = {
    // Getting started
    "first-task": taskTotal > 0,
    "first-focus": focusTotal > 0,
    "first-checkin": (streakMap.get("wellness")?.totalXp || 0) > 0,
    "first-routine": (streakMap.get("routines")?.totalXp || 0) > 0,
    "first-habit": habitCheckCount > 0,

    // Streaks
    "streak-3": longestDaily >= 3,
    "streak-7": longestDaily >= 7,
    "streak-14": longestDaily >= 14,
    "streak-30": longestDaily >= 30,

    // Volume milestones
    "focus-10": focusCount >= 10,
    "focus-50": focusCount >= 50,
    "tasks-25": taskTotal / XP_PER_ACTIVITY >= 25,
    "habits-7": habitsStreak >= 7,

    // Multi-module
    "well-rounded": dailyStreak >= 1 && taskStreak >= 1 && habitsStreak >= 1 && wellnessStreak >= 1,

    // XP milestones
    "xp-500": totalXp >= 500,
  };

  const toAward: string[] = [];
  for (const ach of achievements) {
    if (!unlockedIds.has(ach.id) && checks[ach.key]) {
      toAward.push(ach.id);
    }
  }

  if (toAward.length > 0) {
    await prisma.userAchievement.createMany({
      data: toAward.map((achievementId) => ({ userId, achievementId })),
      skipDuplicates: true,
    });
  }

  // Return names of newly awarded achievements
  return achievements
    .filter((a) => toAward.includes(a.id))
    .map((a) => ({ name: a.name, xpReward: a.xpReward }));
}
