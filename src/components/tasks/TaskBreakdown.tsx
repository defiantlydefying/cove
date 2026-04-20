"use client";

import { useState } from "react";

const GRANULARITY_LABELS = [
  "", "Broad steps", "Some detail", "Detailed", "Specific", "Micro-steps"
];

interface TaskBreakdownProps {
  taskTitle: string;
  taskDescription?: string;
  onAccept: (steps: { title: string }[]) => void;
  onCancel: () => void;
}

export default function TaskBreakdown({ taskTitle, taskDescription, onAccept, onCancel }: TaskBreakdownProps) {
  const [granularity, setGranularity] = useState(3);
  const [steps, setSteps] = useState<{ title: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function generate() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/tasks/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDescription, granularity }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSteps(data.steps || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 p-3 bg-cove-offwhite rounded-xl border border-cove-border/50">
      {/* Granularity slider */}
      <div className="flex items-center gap-3 mb-3">
        <label className="text-[10px] text-cove-muted shrink-0">Detail level</label>
        <input
          type="range"
          min={1}
          max={5}
          value={granularity}
          onChange={(e) => { setGranularity(Number(e.target.value)); setSteps(null); }}
          className="flex-1 h-1.5 accent-cove-accent"
        />
        <span className="text-[10px] text-cove-accent font-medium w-20 text-right">
          {GRANULARITY_LABELS[granularity]}
        </span>
      </div>

      {/* Generate / Regenerate */}
      {!steps && (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Breaking it down..." : "Generate steps"}
        </button>
      )}

      {error && (
        <p className="text-xs text-cove-error mt-2">Couldn&apos;t generate steps. Try again.</p>
      )}

      {/* Preview */}
      {steps && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-cove-muted">{steps.length} steps generated</p>
          <ul className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-cove-charcoal">
                <span className="text-cove-muted shrink-0 mt-0.5">{i + 1}.</span>
                {step.title}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onAccept(steps)}
              className="flex-1 py-1.5 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => { setSteps(null); generate(); }}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel when no steps yet */}
      {!steps && !loading && (
        <button
          onClick={onCancel}
          className="w-full mt-2 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
