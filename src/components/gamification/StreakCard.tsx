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
    <div className="rounded-lg border border-cove-border bg-cove-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-cove-charcoal">
          {label}
        </h3>
        {paused && (
          <span className="text-xs text-cove-muted">
            Paused
          </span>
        )}
      </div>
      <p className="mt-1 text-3xl font-bold text-cove-charcoal" aria-label={`${streak.currentStreak} day streak`}>
        {streak.currentStreak}
        <span className="ml-1 text-sm font-normal text-cove-muted">
          day{streak.currentStreak !== 1 ? "s" : ""}
        </span>
      </p>
      <div className="mt-2 flex items-center justify-between text-sm text-cove-muted">
        <span>Longest: {streak.longestStreak}</span>
        <span className="text-cove-amber font-medium">{streak.totalXp} XP</span>
      </div>
    </div>
  );
}
