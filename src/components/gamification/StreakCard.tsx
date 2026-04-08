import { memo } from "react";

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

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  daily: { label: "Daily", color: "text-cove-accent", bg: "bg-cove-accent/10" },
  tasks: { label: "Tasks", color: "text-cove-blue", bg: "bg-cove-blue/10" },
  routines: { label: "Routines", color: "text-cove-terracotta", bg: "bg-cove-terracotta/10" },
  wellness: { label: "Wellness", color: "text-cove-heather", bg: "bg-cove-heather/10" },
  focus: { label: "Focus", color: "text-cove-amber", bg: "bg-cove-amber/10" },
  habits: { label: "Habits", color: "text-cove-sage", bg: "bg-cove-sage/10" },
};

function isPaused(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const last = new Date(lastActiveAt);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  last.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  return last.getTime() < yesterday.getTime();
}

function isActiveToday(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const last = new Date(lastActiveAt);
  const today = new Date();
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return last.getTime() === today.getTime();
}

export default memo(function StreakCard({ streak }: { streak: Streak }) {
  const paused = isPaused(streak.lastActiveAt);
  const active = isActiveToday(streak.lastActiveAt);
  const meta = TYPE_META[streak.type] ?? { label: streak.type, color: "text-cove-charcoal", bg: "bg-cove-offwhite" };

  // Generate 7-day dots
  const dots = Array.from({ length: 7 }, (_, i) => {
    if (streak.currentStreak === 0) return false;
    // Show last N days as filled based on current streak
    return i < Math.min(streak.currentStreak, 7);
  }).reverse();

  return (
    <div className={`rounded-xl border border-cove-border ${meta.bg} p-4 transition-all ${active ? "ring-2 ring-cove-accent/30" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-semibold ${meta.color}`}>
          {meta.label}
        </h3>
        {active && (
          <span className="text-[10px] font-medium text-cove-accent bg-cove-accent/15 px-2 py-0.5 rounded-full">
            Active today
          </span>
        )}
        {paused && !active && (
          <span className="text-[10px] text-cove-muted bg-cove-offwhite px-2 py-0.5 rounded-full">
            Missed a day
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold tabular-nums ${meta.color}`} aria-label={`${streak.currentStreak} day streak`}>
          {streak.currentStreak}
        </span>
        <span className="text-sm text-cove-muted">
          day{streak.currentStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* 7-day dots */}
      <div className="flex gap-1 mt-2 mb-2">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              filled ? `${meta.bg} border-2 border-current ${meta.color}` : "bg-cove-border/30"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-cove-muted">
        <span>Best: {streak.longestStreak}d</span>
        <span className="text-cove-amber font-semibold">{streak.totalXp} XP</span>
      </div>
    </div>
  );
});
