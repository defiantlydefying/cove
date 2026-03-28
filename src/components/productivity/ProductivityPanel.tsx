"use client";

import { ProductivityProvider, useProductivity } from "./ProductivityContext";
import FocusTimer from "./FocusTimer";
import TimeSummary from "./TimeSummary";
import DailyPlanner from "./DailyPlanner";
import GoalsHabits from "./GoalsHabits";

function ProductivityContent() {
  const { loading, error, fetchAll } = useProductivity();

  if (loading) {
    return (
      <div className="flex gap-4 h-full">
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-48 bg-cove-offwhite rounded-xl animate-pulse" />
          <div className="h-32 bg-cove-offwhite rounded-xl animate-pulse" />
        </div>
        <div className="w-64 shrink-0">
          <div className="h-72 bg-cove-offwhite rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-cove-muted">
          Failed to load productivity data
        </p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-auto">
        <DailyPlanner />
        <GoalsHabits />
      </div>

      {/* Timer sidebar */}
      <div className="w-64 shrink-0 flex flex-col bg-cove-card rounded-xl border border-cove-border overflow-hidden">
        <FocusTimer />
        <TimeSummary />
      </div>
    </div>
  );
}

export default function ProductivityPanel() {
  return (
    <ProductivityProvider>
      <ProductivityContent />
    </ProductivityProvider>
  );
}
