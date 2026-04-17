import { memo } from "react";

export interface ModuleStreak {
  type: string;
  current: number;
  longest: number;
  week: boolean[]; // 7 booleans, Mon-Sun of current week
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

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getTodayWeekdayIndex(): number {
  // Monday = 0, Sunday = 6
  const d = new Date().getDay(); // 0 Sun .. 6 Sat
  return d === 0 ? 6 : d - 1;
}

export default memo(function StreakCard({ streak }: { streak: ModuleStreak }) {
  const meta = TYPE_META[streak.type] ?? {
    label: streak.type,
    color: "text-cove-charcoal",
    bg: "bg-cove-offwhite",
  };

  const todayIdx = getTodayWeekdayIndex();
  const activeToday = streak.week[todayIdx];

  return (
    <div
      className={`rounded-xl border border-cove-border ${meta.bg} p-4 transition-all ${
        activeToday ? "ring-2 ring-cove-accent/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-semibold ${meta.color}`}>{meta.label}</h3>
        {activeToday && (
          <span className="text-[10px] font-medium text-cove-accent bg-cove-accent/15 px-2 py-0.5 rounded-full">
            Active today
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={`text-3xl font-bold tabular-nums ${meta.color}`}
          aria-label={`${streak.current} day streak`}
        >
          {streak.current}
        </span>
        <span className="text-sm text-cove-muted">
          day{streak.current !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Real week view (Mon-Sun) */}
      <div className="flex gap-1 mt-2 mb-2" aria-label="This week">
        {streak.week.map((hit, i) => {
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className={`w-full h-3 rounded-full transition-all ${
                  hit
                    ? `${meta.bg} border-2 border-current ${meta.color}`
                    : "bg-cove-border/30"
                } ${isToday ? "ring-1 ring-cove-accent/50 ring-offset-1 ring-offset-transparent" : ""}`}
                aria-label={`${DAY_LABELS[i]}${hit ? " active" : ""}`}
              />
              <span className="text-[9px] text-cove-muted leading-none">
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-cove-muted mt-1">
        <span>Best: {streak.longest}d</span>
        <span className="text-cove-amber font-semibold">{streak.totalXp} XP</span>
      </div>
    </div>
  );
});
