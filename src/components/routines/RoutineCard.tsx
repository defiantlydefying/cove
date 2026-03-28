"use client";

import { useState } from "react";

export interface RoutineStep {
  id: string;
  title: string;
  durationMinutes?: number | null;
}

export interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
  active: boolean;
  startTime?: string | null;
  showTimes?: boolean;
  showDurations?: boolean;
}

interface RoutineCardProps {
  routine: Routine;
  completedSteps: string[];
  onStepToggle: (routineId: string, stepId: string, checked: boolean) => void;
  onDelete: (routineId: string) => void;
  onEdit: (routineId: string) => void;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function addMinutes(time24: string, minutes: number): string {
  const [h, m] = time24.split(":").map(Number);
  const totalMin = h * 60 + m + minutes;
  const newH = Math.floor(totalMin / 60) % 24;
  const newM = totalMin % 60;
  return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
}

export default function RoutineCard({
  routine,
  completedSteps,
  onStepToggle,
  onDelete,
  onEdit,
}: RoutineCardProps) {
  const [expanded, setExpanded] = useState(true);

  const doneCount = routine.steps.filter((s) =>
    completedSteps.includes(s.id)
  ).length;
  const totalSteps = routine.steps.length;
  const progressPercent = totalSteps > 0 ? (doneCount / totalSteps) * 100 : 0;

  const showTimes = routine.showTimes ?? false;
  const showDurations = routine.showDurations ?? false;
  const totalMinutes = routine.steps.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0
  );

  // Calculate start times for each step
  let cumulativeMinutes = 0;
  const stepTimes = routine.steps.map((step) => {
    const time = routine.startTime
      ? addMinutes(routine.startTime, cumulativeMinutes)
      : null;
    cumulativeMinutes += step.durationMinutes ?? 0;
    return time;
  });

  return (
    <div
      className={`bg-cove-card rounded-xl shadow-sm border border-cove-border-light p-5 flex flex-col gap-3 transition-opacity ${
        routine.active ? "" : "opacity-50"
      }`}
      data-testid="routine-card"
    >
      {/* Progress bar */}
      <div className="w-full h-2 bg-cove-offwhite rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-cove-accent transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          data-testid="progress-bar"
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-base text-cove-charcoal truncate">
            {routine.name}
          </h3>
          <span className="text-xs text-cove-muted shrink-0">
            {doneCount}/{totalSteps} steps done
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse steps" : "Expand steps"}
            className="text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button onClick={() => onEdit(routine.id)} aria-label={`Edit ${routine.name}`} className="text-cove-muted hover:text-cove-charcoal transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(routine.id)} aria-label={`Delete ${routine.name}`} className="text-cove-muted hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Schedule summary */}
      {(showTimes || showDurations) && totalMinutes > 0 && (
        <p className="text-xs text-cove-muted -mt-1">
          {showTimes && routine.startTime
            ? `Starts at ${formatTime12h(routine.startTime)} · `
            : ""}
          {totalMinutes} min total
        </p>
      )}

      {/* Steps checklist */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-fade-in-up">
          {routine.steps.map((step, index) => {
            const checked = completedSteps.includes(step.id);
            return (
              <label
                key={step.id}
                className="flex items-center gap-3 text-sm cursor-pointer group/step"
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onStepToggle(routine.id, step.id, e.target.checked)
                    }
                    aria-label={`Toggle ${step.title}`}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      checked
                        ? "bg-cove-accent border-transparent"
                        : "border-cove-border hover:border-cove-accent"
                    }`}
                  >
                    {checked && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className={`flex-1 transition-all ${
                    checked
                      ? "line-through text-cove-muted"
                      : "text-cove-charcoal"
                  }`}
                >
                  {step.title}
                </span>
                {(showTimes || showDurations) && (
                  <span className="text-xs text-cove-muted shrink-0 tabular-nums">
                    {showTimes && stepTimes[index]
                      ? formatTime12h(stepTimes[index]!)
                      : ""}
                    {showTimes && stepTimes[index] && step.durationMinutes
                      ? " · "
                      : ""}
                    {showDurations && step.durationMinutes
                      ? `${step.durationMinutes}m`
                      : ""}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
