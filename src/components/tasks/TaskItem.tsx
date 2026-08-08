"use client";

import { memo, useState, useCallback } from "react";
import { tapLight } from "@/lib/capacitor/haptics";
import { DeferPopover, WontDoPopover } from "./TaskActions";

function formatWhen(scheduledDate: string): string {
  const datePart = scheduledDate.slice(0, 10);
  if (datePart.startsWith("2999")) return "Someday";
  const d = new Date(datePart + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
import TaskBreakdown from "./TaskBreakdown";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  status: string;
  stage: string;
  scheduledDate?: string | null;
  deferredUntil?: string;
  deadline?: string;
  priority: string;
  energyLevel?: string;
  parentId?: string;
  sortOrder: number;
  completedReason?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  subtasks?: Task[];
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onAddSubTasks: (parentId: string, steps: { title: string }[]) => void;
  compact?: boolean;
  onDragStart?: () => void;
}

const ENERGY_LABELS: Record<string, string> = {
  low: "Low",
  "low energy": "Low",
  moderate: "Med",
  high: "High",
  "high focus": "High",
};

function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default memo(function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubTasks,
  compact = false,
  onDragStart,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDefer, setShowDefer] = useState(false);
  const [showWontDo, setShowWontDo] = useState(false);

  const isDimmed = task.status === "completed" || task.status === "wont_do";
  const completedCount = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalCount = task.subtasks?.length ?? 0;
  const hasSubtasks = totalCount > 0;

  const handleToggle = useCallback(() => {
    if (!task.completed) tapLight();
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  const closeAll = useCallback(() => {
    setShowDefer(false);
    setShowWontDo(false);
  }, []);

  return (
    <div
      className={`group rounded-lg transition-colors ${isDimmed ? "opacity-40" : ""}`}
      data-testid="task-item"
      draggable={!isDimmed}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/cove-task", JSON.stringify({
          id: task.id,
          title: task.title,
          priority: task.priority,
        }));
        e.dataTransfer.effectAllowed = "copy";
        onDragStart?.();
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 py-3 px-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          aria-label={`Toggle ${task.title}`}
          className="mt-1 shrink-0 h-4 w-4 rounded border-cove-border accent-cove-accent focus:ring-cove-accent/20"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Priority dot */}
            {task.priority !== "medium" && (
              <span
                className={`shrink-0 h-2 w-2 rounded-full ${
                  task.priority === "high"
                    ? "bg-cove-error"
                    : "bg-cove-sage"
                }`}
                aria-label={`${task.priority} priority`}
              />
            )}

            {/* Title */}
            <span
              className={`break-words text-sm ${
                isDimmed
                  ? "line-through text-cove-muted"
                  : "text-cove-charcoal"
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {/* When tag (a plan date — never moves the task) */}
            {!compact && task.scheduledDate && (
              <span className="text-[11px] text-cove-accent bg-cove-accent-light rounded-full px-1.5 py-0.5">
                {formatWhen(task.scheduledDate)}
              </span>
            )}

            {/* Deadline */}
            {!compact && task.deadline && (
              <span
                className={`text-xs ${
                  new Date(task.deadline) < new Date()
                    ? "text-cove-error"
                    : "text-cove-muted"
                }`}
              >
                {formatDeadline(task.deadline)}
              </span>
            )}

            {/* Energy level badge */}
            {!compact && task.energyLevel && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-cove-accent-light text-cove-accent">
                {ENERGY_LABELS[task.energyLevel] ?? task.energyLevel}
              </span>
            )}

            {/* Subtask progress */}
            {hasSubtasks && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
              >
                {completedCount} of {totalCount} steps
              </button>
            )}
          </div>
        </div>

        {/* Hover action buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative">
          {/* Break down */}
          <button
            onClick={() => { closeAll(); setShowBreakdown((v) => !v); }}
            aria-label="Break down task"
            className="p-1 text-cove-muted hover:text-cove-charcoal transition-colors rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Defer */}
          <button
            onClick={() => { setShowWontDo(false); setShowBreakdown(false); setShowDefer((v) => !v); }}
            aria-label="Defer task"
            className="p-1 text-cove-muted hover:text-cove-charcoal transition-colors rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>

          {/* Won't do */}
          <button
            onClick={() => { setShowDefer(false); setShowBreakdown(false); setShowWontDo((v) => !v); }}
            aria-label="Won't do"
            className="p-1 text-cove-muted hover:text-cove-charcoal transition-colors rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            className="p-1 text-cove-muted hover:text-cove-error transition-colors rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          {/* Popovers */}
          {showDefer && (
            <DeferPopover
              onDefer={(data) => onUpdate(task.id, data)}
              onClose={() => setShowDefer(false)}
            />
          )}
          {showWontDo && (
            <WontDoPopover
              onWontDo={(reason) =>
                onUpdate(task.id, {
                  status: "wont_do",
                  completed: true,
                  completedReason: reason,
                })
              }
              onClose={() => setShowWontDo(false)}
            />
          )}
        </div>
      </div>

      {/* TaskBreakdown panel */}
      {showBreakdown && (
        <div className="px-2 pb-2">
          <TaskBreakdown
            taskTitle={task.title}
            taskDescription={task.description}
            onAccept={(steps) => {
              onAddSubTasks(task.id, steps);
              setShowBreakdown(false);
            }}
            onCancel={() => setShowBreakdown(false)}
          />
        </div>
      )}

      {/* Expanded subtasks */}
      {expanded && hasSubtasks && (
        <div className="pl-10 pr-2 pb-2 flex flex-col gap-1">
          {task.subtasks!.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-2 py-1 group/sub"
            >
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => {
                  if (!sub.completed) tapLight();
                  onToggle(sub.id);
                }}
                aria-label={`Toggle ${sub.title}`}
                className="shrink-0 h-3.5 w-3.5 rounded border-cove-border accent-cove-accent"
              />
              <span
                className={`text-xs flex-1 ${
                  sub.completed
                    ? "line-through text-cove-muted"
                    : "text-cove-charcoal"
                }`}
              >
                {sub.title}
              </span>
              <button
                onClick={() => onDelete(sub.id)}
                aria-label={`Delete ${sub.title}`}
                className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-cove-muted hover:text-cove-error transition-all rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
