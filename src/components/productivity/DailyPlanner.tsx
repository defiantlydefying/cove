"use client";

import { useState, useCallback } from "react";
import { useProductivity } from "./ProductivityContext";
import PlannerPriorityView from "./PlannerPriorityView";
import PlannerListView from "./PlannerListView";

type ViewMode = "week" | "list";

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function getMondayStr(dateStr?: string) {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DailyPlanner() {
  const {
    plannerItems,
    weekStartDate,
    setWeekStartDate,
    addPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
    reorderPlannerItems,
  } = useProductivity();
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const todayStr = new Date().toISOString().split("T")[0];
  const weekEnd = addDays(weekStartDate, 6);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStartDate, i);
    const d = new Date(date + "T00:00:00");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    return { date, dayName, dayNum, isToday: date === todayStr };
  });

  const handleToggleComplete = (id: string) => {
    const item = plannerItems.find((i) => i.id === id);
    if (item) updatePlannerItem({ id, completed: !item.completed });
  };

  const handleAdd = useCallback((item: { title: string; date?: string; zone?: string; startTime?: string; endTime?: string }) => {
    addPlannerItem({
      title: item.title,
      zone: item.zone || "must",
      date: item.date || todayStr,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  }, [addPlannerItem, todayStr]);

  const goToday = () => setWeekStartDate(getMondayStr());
  const goPrev = () => setWeekStartDate(addDays(weekStartDate, -7));
  const goNext = () => setWeekStartDate(addDays(weekStartDate, 7));

  const isCurrentWeek = weekStartDate === getMondayStr();

  const viewProps = {
    items: plannerItems,
    weekDays,
    onToggleComplete: handleToggleComplete,
    onUpdate: updatePlannerItem,
    onDelete: deletePlannerItem,
    onAdd: handleAdd,
    onReorder: reorderPlannerItems,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header with week nav and view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-cove-charcoal">
            Planner
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-1 rounded-md text-cove-muted hover:text-cove-charcoal hover:bg-cove-offwhite transition-colors"
              aria-label="Previous week"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                isCurrentWeek
                  ? "bg-cove-accent text-white border-cove-accent"
                  : "border-cove-border text-cove-charcoal hover:bg-cove-offwhite"
              }`}
            >
              Today
            </button>
            <button
              onClick={goNext}
              className="p-1 rounded-md text-cove-muted hover:text-cove-charcoal hover:bg-cove-offwhite transition-colors"
              aria-label="Next week"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-cove-muted">
            {formatShortDate(weekStartDate)} — {formatShortDate(weekEnd)}
          </span>
        </div>

        <div className="flex bg-cove-offwhite rounded-full p-0.5">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              viewMode === "week"
                ? "bg-cove-accent text-white"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              viewMode === "list"
                ? "bg-cove-accent text-white"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "week" ? (
        <PlannerPriorityView {...viewProps} />
      ) : (
        <PlannerListView
          items={plannerItems}
          onToggleComplete={handleToggleComplete}
          onUpdate={updatePlannerItem}
          onDelete={deletePlannerItem}
          onAdd={(item) => handleAdd(item)}
          onReorder={reorderPlannerItems}
        />
      )}
    </div>
  );
}
