"use client";

import { useState } from "react";
import { useProductivity } from "./ProductivityContext";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function getWeekDays(): { label: string; date: string }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, date: d.toISOString().split("T")[0] };
  });
}

export default function TimeSummary() {
  const { focusSessions, weekSessions, timeEntries } = useProductivity();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Today's focus time
  const todayFocusMin = focusSessions
    .filter((s) => s.sessionType === "focus")
    .reduce((sum, s) => sum + s.durationMin, 0);

  const todayManualMin = timeEntries
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((sum, e) => sum + e.durationMin, 0);

  const todayTotal = todayFocusMin + todayManualMin;
  const todaySessionCount = focusSessions.filter(
    (s) => s.sessionType === "focus"
  ).length;

  // Weekly bar chart data
  const weekDays = getWeekDays();
  const dailyTotals = weekDays.map(({ date }) => {
    const sessionMin = weekSessions
      .filter(
        (s) => s.sessionType === "focus" && s.completedAt.startsWith(date)
      )
      .reduce((sum, s) => sum + s.durationMin, 0);
    const entryMin = timeEntries
      .filter((e) => e.date.startsWith(date))
      .reduce((sum, e) => sum + e.durationMin, 0);
    return sessionMin + entryMin;
  });

  const maxDaily = Math.max(...dailyTotals, 1);

  // Breakdown by label
  const labelMap = new Map<string, number>();
  focusSessions
    .filter((s) => s.sessionType === "focus")
    .forEach((s) => {
      const key = s.label || "Unlabeled";
      labelMap.set(key, (labelMap.get(key) || 0) + s.durationMin);
    });
  timeEntries.forEach((e) => {
    labelMap.set(e.label, (labelMap.get(e.label) || 0) + e.durationMin);
  });

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-cove-border">
      {/* Today */}
      <div>
        <p className="text-xs font-semibold text-cove-charcoal mb-1">Today</p>
        <p className="text-lg font-semibold text-cove-charcoal">
          {formatDuration(todayTotal)}
        </p>
        <p className="text-xs text-cove-muted">
          {todaySessionCount} focus session{todaySessionCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* This Week bar chart */}
      <div>
        <p className="text-xs font-semibold text-cove-charcoal mb-2">
          This Week
        </p>
        <div className="flex items-end gap-1 h-20">
          {weekDays.map(({ label, date }, i) => {
            const isToday = date === todayStr;
            const height =
              dailyTotals[i] > 0
                ? Math.max((dailyTotals[i] / maxDaily) * 100, 8)
                : 4;
            return (
              <div
                key={date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday ? "bg-cove-accent" : "bg-cove-accent/30"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${formatDuration(dailyTotals[i])}`}
                />
                <span
                  className={`text-[10px] ${
                    isToday
                      ? "text-cove-accent font-semibold"
                      : "text-cove-muted"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown */}
      {labelMap.size > 0 && (
        <div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            {showBreakdown ? "Hide" : "Show"} breakdown
          </button>
          {showBreakdown && (
            <div className="mt-2 flex flex-col gap-1">
              {Array.from(labelMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([lbl, mins]) => (
                  <div
                    key={lbl}
                    className="flex justify-between text-xs text-cove-charcoal"
                  >
                    <span className="truncate mr-2">{lbl}</span>
                    <span className="text-cove-muted whitespace-nowrap">
                      {formatDuration(mins)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
