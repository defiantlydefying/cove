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

  const streaks = await prisma.userStreak.findMany({
    where: { userId },
  });

  const totalXp = streaks.reduce((sum, s) => sum + s.totalXp, 0);

  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });

  return NextResponse.json({
    streaks,
    totalXp,
    achievements: achievements.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      xpReward: ua.achievement.xpReward,
      unlockedAt: ua.unlockedAt,
    })),
  });
}
