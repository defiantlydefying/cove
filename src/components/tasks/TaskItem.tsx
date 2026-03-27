"use client";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  deadline?: string;
  energyLevel?: "low energy" | "moderate" | "high focus";
  priority?: "low" | "medium" | "high";
  duration?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 px-2 group rounded-lg hover:bg-white/5 transition-colors" data-testid="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Toggle ${task.title}`}
        className="mt-1 shrink-0 h-4 w-4 rounded border-white/30 accent-cove-accent focus:ring-white/20"
      />
      <div className="flex-1 min-w-0">
        <span
          className={
            task.completed
              ? "line-through text-white/40"
              : "text-white/90"
          }
        >
          {task.title}
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {task.deadline && (
            <span className="text-xs text-white/50">{task.deadline}</span>
          )}
          {task.energyLevel && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/10 text-white/70">
              {task.energyLevel}
            </span>
          )}
          {task.priority && task.priority !== "medium" && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${
                task.priority === "high"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
      {onEdit && (
        <button
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80 shrink-0 mt-0.5 transition-opacity"
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80 shrink-0 mt-0.5 transition-opacity"
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
