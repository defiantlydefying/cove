export interface Streak {
  id: string;
  userId: string;
  type: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string | null;
  pausedAt: string | null;
  totalXp: number;
}

const TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  tasks: "Tasks",
  routines: "Routines",
  wellness: "Wellness",
};

function isPaused(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const last = new Date(lastActiveAt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Set all to start of day for comparison
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  return last.getTime() < yesterday.getTime();
}

export default function StreakCard({ streak }: { streak: Streak }) {
  const paused = isPaused(streak.lastActiveAt);
  const label = TYPE_LABELS[streak.type] ?? streak.type;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </h3>
        {paused && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Paused
          </span>
        )}
      </div>
      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
        {streak.currentStreak}
        <span className="ml-1 text-sm font-normal text-gray-500">
          day{streak.currentStreak !== 1 ? "s" : ""}
        </span>
      </p>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Longest: {streak.longestStreak}</span>
        <span>{streak.totalXp} XP</span>
      </div>
    </div>
  );
}
