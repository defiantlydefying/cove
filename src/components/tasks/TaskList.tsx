"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import TaskInput from "./TaskInput";
import TaskItem, { Task } from "./TaskItem";
import TaskDetail from "./TaskDetail";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchTasks() {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleAdd(title: string) {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = { id: tempId, title, completed: false };
    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      toast("Couldn\u2019t add task. Try again.", "error");
    }
  }

  async function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const task = tasks.find((t) => t.id === id);
      const willComplete = !task?.completed;
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: willComplete }),
      });
      if (!res.ok) throw new Error();
      if (willComplete) {
        const data = await res.json();
        const gam = data?.gamification;
        if (gam?.xpEarned) {
          toast(`Task complete  +${gam.xpEarned} XP`, "success");
        }
        if (gam?.newAchievements?.length) {
          for (const a of gam.newAchievements) {
            setTimeout(() => toast(`Achievement unlocked: ${a.name}`, "success"), 500);
          }
        }
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      toast("Couldn\u2019t update task. Try again.", "error");
    }
  }

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Task deleted.", "success");
    } catch {
      setTasks(prev);
      toast("Couldn\u2019t delete task. Try again.", "error");
    }
  }

  function handleEdit(task: Task) {
    setSelectedTask(task);
  }

  function handleSave(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(null);
    toast("Task saved.", "success");
  }

  function handleCancelEdit() {
    setSelectedTask(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm text-white/90">Tasks</p>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm text-white/90">Tasks</p>
        <p className="text-sm text-white/50">Couldn&apos;t load tasks.</p>
        <button
          onClick={fetchTasks}
          className="text-sm text-white/70 hover:text-white underline self-start"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-sm text-white/90">Tasks</p>
      <TaskInput onAdd={handleAdd} />
      <div className="flex flex-col divide-y divide-white/10">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDeleteRequest}
            onEdit={handleEdit}
          />
        ))}
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-4 px-2">
          <p className="text-sm text-white/60 font-medium mb-1">Your task list is empty</p>
          <p className="text-xs text-white/40 leading-relaxed">
            Type in the box above and press Enter to add your first task. Start small — even one thing counts.
          </p>
        </div>
      )}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-cove-error-light border border-cove-error/20">
          <p className="text-sm text-white/80 flex-1">Delete this task?</p>
          <button
            onClick={handleDeleteConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cove-error text-white hover:bg-cove-error/90 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
