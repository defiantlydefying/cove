"use client";

export interface RoutineStep {
  id: string;
  title: string;
}

export interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
  active: boolean;
}

interface RoutineCardProps {
  routine: Routine;
  completedSteps: string[];
  onStepToggle: (routineId: string, stepId: string, checked: boolean) => void;
  onDelete: (routineId: string) => void;
  onEdit: (routineId: string) => void;
}

export default function RoutineCard({
  routine,
  completedSteps,
  onStepToggle,
  onDelete,
  onEdit,
}: RoutineCardProps) {
  const doneCount = routine.steps.filter((s) =>
    completedSteps.includes(s.id)
  ).length;

  return (
    <div
      className={`border rounded p-4 flex flex-col gap-2 ${
        routine.active ? "" : "opacity-50"
      }`}
      data-testid="routine-card"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-cove-charcoal">{routine.name}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(routine.id)}
            aria-label={`Edit ${routine.name}`}
            className="text-cove-muted hover:text-cove-charcoal text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(routine.id)}
            aria-label={`Delete ${routine.name}`}
            className="text-cove-muted hover:text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {routine.steps.map((step) => {
          const checked = completedSteps.includes(step.id);
          return (
            <label key={step.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  onStepToggle(routine.id, step.id, e.target.checked)
                }
                aria-label={`Toggle ${step.title}`}
              />
              <span className={checked ? "line-through text-cove-muted" : "text-cove-charcoal"}>
                {step.title}
              </span>
            </label>
          );
        })}
      </div>

      <p className="text-xs text-cove-muted">
        {doneCount}/{routine.steps.length} steps done
      </p>
    </div>
  );
}
