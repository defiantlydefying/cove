"use client";

import { useState } from "react";
import { useProductivity } from "./ProductivityContext";
import PlannerPriorityView from "./PlannerPriorityView";
import PlannerListView from "./PlannerListView";

type ViewMode = "zones" | "list";

export default function DailyPlanner() {
  const {
    plannerItems,
    selectedDate,
    setSelectedDate,
    addPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
    reorderPlannerItems,
  } = useProductivity();
  const [viewMode, setViewMode] = useState<ViewMode>("zones");

  const handleToggleComplete = (id: string) => {
    const item = plannerItems.find((i) => i.id === id);
    if (item) updatePlannerItem({ id, completed: !item.completed });
  };

  const handleAdd = (item: { title: string; zone?: string; startTime?: string; endTime?: string }) => {
    addPlannerItem({
      title: item.title,
      zone: item.zone || "must",
      date: selectedDate,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  };

  const viewProps = {
    items: plannerItems,
    onToggleComplete: handleToggleComplete,
    onUpdate: updatePlannerItem,
    onDelete: deletePlannerItem,
    onAdd: handleAdd,
    onReorder: reorderPlannerItems,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header with date picker and view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-cove-charcoal">
            Daily Planner
          </h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-cove-charcoal/30 rounded-lg bg-cove-offwhite text-cove-charcoal font-medium focus:outline-none focus:ring-1 focus:ring-cove-accent"
          />
        </div>

        <div className="flex bg-cove-offwhite rounded-full p-0.5">
          <button
            onClick={() => setViewMode("zones")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              viewMode === "zones"
                ? "bg-cove-accent text-white"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Zones
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
      {viewMode === "zones" ? (
        <PlannerPriorityView {...viewProps} />
      ) : (
        <PlannerListView {...viewProps} />
      )}
    </div>
  );
}
