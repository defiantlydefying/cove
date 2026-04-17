"use client";

import { ProductivityProvider, useProductivity } from "./ProductivityContext";
import DailyPlanner from "./DailyPlanner";

function PlannerContent() {
  const { loading, error, fetchAll } = useProductivity();

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-48 bg-cove-offwhite rounded-xl animate-pulse" />
        <div className="h-32 bg-cove-offwhite rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-cove-muted">Failed to load planner data</p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return <DailyPlanner />;
}

export default function ProductivityPanel() {
  return (
    <ProductivityProvider>
      <PlannerContent />
    </ProductivityProvider>
  );
}
