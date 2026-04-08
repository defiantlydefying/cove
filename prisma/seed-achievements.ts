import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // Getting started
  { key: "first-task", name: "Task Starter", description: "Complete your first task", xpReward: 25 },
  { key: "first-focus", name: "Deep Focus", description: "Complete your first focus session", xpReward: 25 },
  { key: "first-checkin", name: "Self Aware", description: "Log your first wellness check-in", xpReward: 25 },
  { key: "first-routine", name: "Routine Builder", description: "Complete your first routine", xpReward: 25 },
  { key: "first-habit", name: "Habit Formed", description: "Check off a daily habit for the first time", xpReward: 25 },

  // Streaks
  { key: "streak-3", name: "Getting Consistent", description: "Maintain a 3-day activity streak", xpReward: 50 },
  { key: "streak-7", name: "Week Warrior", description: "Maintain a 7-day activity streak", xpReward: 100 },
  { key: "streak-14", name: "Two Week Strong", description: "Maintain a 14-day activity streak", xpReward: 200 },
  { key: "streak-30", name: "Monthly Master", description: "Maintain a 30-day activity streak", xpReward: 500 },

  // Volume
  { key: "focus-10", name: "Focused Mind", description: "Complete 10 focus sessions", xpReward: 75 },
  { key: "focus-50", name: "Flow State", description: "Complete 50 focus sessions", xpReward: 250 },
  { key: "tasks-25", name: "Task Machine", description: "Complete 25 tasks", xpReward: 150 },
  { key: "habits-7", name: "Habit Streak", description: "Check off a habit 7 days in a row", xpReward: 100 },

  // Multi-module
  { key: "well-rounded", name: "Well Rounded", description: "Use tasks, habits, and wellness in the same day", xpReward: 75 },

  // XP milestones
  { key: "xp-500", name: "XP Collector", description: "Earn 500 total XP", xpReward: 100 },
];

async function main() {
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: { name: ach.name, description: ach.description, xpReward: ach.xpReward },
      create: ach,
    });
  }
  console.log(`Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
