"use client";

import type { Habit } from "./ProductivityContext";

interface HabitItemProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function HabitItem({ habit, onToggle, onDelete }: HabitItemProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const isCheckedToday = habit.checks.some((c) => c.date.startsWith(todayStr));
  const last7 = getLast7Days();

  return (
    <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cove-offwhite transition-colors">
      <input
        type="checkbox"
        checked={isCheckedToday}
        onChange={() => onToggle(habit.id)}
        className="w-4 h-4 rounded border-cove-border text-cove-accent focus:ring-cove-accent shrink-0"
      />

      <span
        className={`text-sm flex-1 min-w-0 truncate ${
          isCheckedToday ? "text-cove-muted line-through" : "text-cove-charcoal"
        }`}
      >
        {habit.title}
      </span>

      {/* Weekly dots */}
      <div className="flex gap-0.5 shrink-0">
        {last7.map((date) => {
          const done = habit.checks.some((c) => c.date.startsWith(date));
          return (
            <div
              key={date}
              className={`w-2 h-2 rounded-full ${
                done ? "bg-cove-accent" : "bg-cove-border"
              }`}
            />
          );
        })}
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <span
          className={`text-xs font-medium shrink-0 ${
            habit.currentStreak >= 3 ? "text-amber-600" : "text-cove-muted"
          }`}
        >
          {habit.currentStreak}d
        </span>
      )}

      <button
        onClick={() => onDelete(habit.id)}
        className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-red-500 text-xs transition-opacity shrink-0"
        aria-label="Delete habit"
      >
        &#x2715;
      </button>
    </div>
  );
}
