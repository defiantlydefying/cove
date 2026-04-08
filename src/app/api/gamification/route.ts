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

  const [streaks, userAchievements, allAchievements, taskCount, focusCount, habitCheckCount, checkinCount] =
    await Promise.all([
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
    ]);

  const totalXp = streaks.reduce((sum, s) => sum + s.totalXp, 0);
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  // Calculate level: every 100 XP = 1 level
  const level = Math.floor(totalXp / 100) + 1;
  const xpInLevel = totalXp % 100;
  const xpToNextLevel = 100;

  return NextResponse.json({
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
