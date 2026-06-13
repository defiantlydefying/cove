"use client";

import { useEffect, useState } from "react";

interface RoutineOption {
  id: string;
  name: string;
  steps: { id: string; title: string; durationMinutes?: number | null }[];
  startTime?: string | null;
  showTimes?: boolean;
  showDurations?: boolean;
}

interface RoutineSharePickerProps {
  onSelect: (routine: RoutineOption) => void;
  onCancel: () => void;
}

export default function RoutineSharePicker({ onSelect, onCancel }: RoutineSharePickerProps) {
  const [routines, setRoutines] = useState<RoutineOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/routines")
      .then((res) => (res.ok ? res.json() : []))
      .then(setRoutines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-cove-card border border-cove-border-light rounded-xl p-5">
        <div className="h-20 animate-pulse rounded-lg bg-cove-border-light" />
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-cove-card border border-cove-border-light rounded-xl p-5 text-center">
        <p className="text-sm text-cove-muted">No routines to share yet. Create one first!</p>
        <button
          onClick={onCancel}
          className="mt-3 text-sm text-cove-accent hover:text-cove-accent-hover"
        >
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cove-charcoal">Choose a routine to share</h3>
        <button
          onClick={onCancel}
          className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => onSelect(routine)}
            className="text-left p-3 rounded-lg border border-cove-border-light hover:border-cove-accent/40 hover:bg-cove-offwhite transition-colors"
          >
            <p className="text-sm font-medium text-cove-charcoal">{routine.name}</p>
            <p className="text-xs text-cove-muted mt-0.5">{routine.steps.length} steps</p>
          </button>
        ))}
      </div>
    </div>
  );
}
