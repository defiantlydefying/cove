import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getActivityHistory,
  getCurrentWeekDays,
  computeStreakFromDates,
  type ActivityType,
} from "@/lib/gamification";

const MODULE_TYPES: ActivityType[] = ["tasks", "routines", "wellness", "focus", "habits"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    streaks,
    userAchievements,
    allAchievements,
    taskCount,
    focusCount,
    habitCheckCount,
    checkinCount,
    history,
  ] = await Promise.all([
    prisma.userStreak.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.achievement.findMany({ orderBy: { xpReward: "asc" } }),
    prisma.task.count({ where: { userId, completed: true } }),
    prisma.focusSession.count({ where: { userId, sessionType: "focus" } }),
    prisma.habitCheck.count({ where: { habit: { userId } } }),
    prisma.wellnessCheckin.count({ where: { userId } }),
    getActivityHistory(userId, 60),
  ]);

  const totalXp = streaks.reduce((sum, s) => sum + s.totalXp, 0);
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  // Calculate level: every 100 XP = 1 level
  const level = Math.floor(totalXp / 100) + 1;
  const xpInLevel = totalXp % 100;
  const xpToNextLevel = 100;

  // Daily streak computed from real history
  const now = new Date();
  const dailyCurrent = computeStreakFromDates(history.any, now);
  const dailyStreakRow = streaks.find((s) => s.type === "daily");
  const dailyLongest = Math.max(dailyStreakRow?.longestStreak ?? 0, dailyCurrent);

  // Last active date for the "any" streak
  const sortedDates = Array.from(history.any).sort();
  const lastActiveDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  // Current week days (Mon-Sun) for the "any activity" view
  const weekDays = getCurrentWeekDays(now);
  const weekActivity = weekDays.map((date) => ({
    date,
    hit: history.any.has(date),
  }));

  // Per-module streak + week view
  const modules: Record<string, { current: number; longest: number; week: boolean[]; totalXp: number }> = {};
  for (const type of MODULE_TYPES) {
    const activeSet = history.byType[type];
    const current = computeStreakFromDates(activeSet, now);
    const streakRow = streaks.find((s) => s.type === type);
    const longest = Math.max(streakRow?.longestStreak ?? 0, current);
    const week = weekDays.map((d) => activeSet.has(d));
    modules[type] = {
      current,
      longest,
      week,
      totalXp: streakRow?.totalXp ?? 0,
    };
  }

  return NextResponse.json({
    // Daily streak (Finch-style)
    dailyStreak: {
      current: dailyCurrent,
      longest: dailyLongest,
      lastActiveDate,
    },
    weekActivity,
    weekStartDate: weekDays[0],
    // Per-module streaks with real week history
    modules,
    // Legacy streaks array (kept for backwards compat during transition)
    streaks,
    totalXp,
    level,
    xpInLevel,
    xpToNextLevel,
    stats: {
      tasksCompleted: taskCount,
      focusSessions: focusCount,
      habitChecks: habitCheckCount,
      wellnessCheckins: checkinCount,
    },
    achievements: allAchievements.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      xpReward: a.xpReward,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt || null,
    })),
  });
}
