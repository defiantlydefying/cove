"use client";

import type { WeeklyGoal } from "./ProductivityContext";

interface GoalItemProps {
  goal: WeeklyGoal;
  onUpdate: (goal: { id: string; currentCount?: number }) => void;
  onDelete: (id: string) => void;
}

export default function GoalItem({ goal, onUpdate, onDelete }: GoalItemProps) {
  const progress = Math.min((goal.currentCount / goal.targetCount) * 100, 100);
  const isComplete = goal.currentCount >= goal.targetCount;

  return (
    <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cove-offwhite transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-cove-charcoal truncate">
            {goal.title}
          </span>
          <span className="text-xs text-cove-muted whitespace-nowrap">
            {goal.currentCount}/{goal.targetCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-cove-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? "bg-cove-accent" : "bg-cove-accent/60"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      {goal.linkedHabitId ? (
        <span className="text-[10px] text-cove-muted whitespace-nowrap">
          Auto-tracked
        </span>
      ) : (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() =>
              onUpdate({
                id: goal.id,
                currentCount: Math.max(0, goal.currentCount - 1),
              })
            }
            className="w-5 h-5 text-xs text-cove-muted border border-cove-border rounded hover:bg-cove-offwhite"
          >
            -
          </button>
          <button
            onClick={() =>
              onUpdate({
                id: goal.id,
                currentCount: goal.currentCount + 1,
              })
            }
            className="w-5 h-5 text-xs text-cove-muted border border-cove-border rounded hover:bg-cove-offwhite"
          >
            +
          </button>
        </div>
      )}

      <button
        onClick={() => onDelete(goal.id)}
        className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-red-500 text-xs transition-opacity shrink-0"
        aria-label="Delete goal"
      >
        &#x2715;
      </button>
    </div>
  );
}
