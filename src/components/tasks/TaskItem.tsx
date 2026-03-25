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
    <div className="flex items-start gap-2 py-2 group" data-testid="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Toggle ${task.title}`}
        className="mt-1 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <span
          className={
            task.completed
              ? "line-through text-gray-400"
              : "text-gray-900"
          }
        >
          {task.title}
        </span>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {task.deadline && (
            <span className="text-xs text-gray-400">{task.deadline}</span>
          )}
          {task.energyLevel && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {task.energyLevel}
            </span>
          )}
          {task.priority && task.priority !== "medium" && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                task.priority === "high"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-500"
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
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
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
