"use client";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
  energyLevel?: "low energy" | "moderate" | "high focus";
  priority?: "low" | "medium" | "high";
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 px-2 group rounded-lg hover:bg-cove-sand-light/50 transition-colors" data-testid="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Toggle ${task.title}`}
        className="mt-1 shrink-0 h-4 w-4 rounded border-cove-border text-cove-accent accent-cove-accent focus:ring-cove-accent/30"
      />
      <div className="flex-1 min-w-0">
        <span
          className={
            task.completed
              ? "line-through text-cove-muted"
              : "text-cove-charcoal"
          }
        >
          {task.title}
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {task.deadline && (
            <span className="text-xs text-cove-muted">{task.deadline}</span>
          )}
          {task.energyLevel && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-cove-sage-light text-cove-sage">
              {task.energyLevel}
            </span>
          )}
          {task.priority && task.priority !== "medium" && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${
                task.priority === "high"
                  ? "bg-red-50 text-red-600"
                  : "bg-cove-accent-light text-cove-accent"
              }`}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
        className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-cove-charcoal shrink-0 mt-0.5 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
  );
}
