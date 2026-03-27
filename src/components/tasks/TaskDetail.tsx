"use client";

import { useState } from "react";
import { Task } from "./TaskItem";

interface TaskDetailProps {
  task: Task;
  onSave: (updated: Task) => void;
  onCancel: () => void;
}

export default function TaskDetail({ task, onSave, onCancel }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [deadline, setDeadline] = useState(task.deadline ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task.priority ?? "medium"
  );
  const [energyLevel, setEnergyLevel] = useState<
    "low energy" | "moderate" | "high focus" | ""
  >(task.energyLevel ?? "");
  const [duration, setDuration] = useState<number>(task.duration ?? 1);
  const [isRecurring, setIsRecurring] = useState(task.isRecurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState(
    task.recurrenceRule ?? ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description || null,
        deadline: deadline || null,
        priority,
        energyLevel: energyLevel || null,
        duration,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule || null : null,
      };

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setSaving(false);
        return;
      }

      const updated = await res.json();
      onSave({
        id: updated.id,
        title: updated.title,
        completed: updated.completed,
        description: updated.description ?? undefined,
        deadline: updated.deadline
          ? new Date(updated.deadline).toISOString().slice(0, 16)
          : undefined,
        priority: updated.priority ?? undefined,
        energyLevel: updated.energyLevel ?? undefined,
        duration: updated.duration ?? undefined,
        isRecurring: updated.isRecurring ?? undefined,
        recurrenceRule: updated.recurrenceRule ?? undefined,
      });
    } catch {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-white/15 rounded-lg bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-colors";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-white/5 border border-white/10" data-testid="task-detail">
      <p className="text-sm font-medium text-white/90">Edit Task</p>

      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Task title"
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Add a description..."
        />
      </div>

      <div>
        <label className={labelClass}>Due date and time</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Priority</label>
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
          className={inputClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Energy level</label>
        <select
          value={energyLevel}
          onChange={(e) =>
            setEnergyLevel(
              e.target.value as "low energy" | "moderate" | "high focus" | ""
            )
          }
          className={inputClass}
        >
          <option value="">Not set</option>
          <option value="low energy">Low energy</option>
          <option value="moderate">Medium energy</option>
          <option value="high focus">High focus</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Duration (days)</label>
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
          className={inputClass}
          placeholder="How many days is this task for?"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurring-toggle"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-white/30 accent-cove-accent"
        />
        <label htmlFor="recurring-toggle" className="text-sm text-white/80">
          Recurring
        </label>
      </div>

      {isRecurring && (
        <div>
          <label className={labelClass}>Recurrence rule</label>
          <input
            type="text"
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
            className={inputClass}
            placeholder="e.g. every weekday, weekly on Mon..."
          />
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-cove-accent text-white hover:bg-cove-accent/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
