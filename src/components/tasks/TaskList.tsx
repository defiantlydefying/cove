"use client";

import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import TaskItem, { Task } from "./TaskItem";
import { DeferPopover } from "./TaskActions";

interface TaskListProps {
  onNavigateToTasks?: () => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function isOverdue(task: Task): boolean {
  if (task.status !== "active" || task.stage !== "today") return false;
  const today = todayStr();
  if (task.scheduledDate && task.scheduledDate < today) return true;
  if (task.deadline && task.deadline < today) return true;
  return false;
}

export default function TaskList({ onNavigateToTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [needsAttentionCollapsed, setNeedsAttentionCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("cove-needs-attention-collapsed") !== "false";
  });
  const [deferTaskId, setDeferTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/tasks?stage=today");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function toggleNeedsAttention() {
    setNeedsAttentionCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("cove-needs-attention-collapsed", String(next));
      return next;
    });
  }

  // Quick capture
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputValue.trim()) {
      const raw = inputValue.trim();
      let title = raw;
      let stage = "inbox";

      if (raw.toLowerCase().startsWith("today: ")) {
        title = raw.slice(7).trim();
        stage = "today";
      }

      handleAdd(title, stage);
      setInputValue("");
    }
  }

  async function handleAdd(title: string, stage: string) {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title,
      completed: false,
      status: "active",
      stage,
      priority: "medium",
      sortOrder: 0,
    };

    // Only optimistically add to the list if it's a "today" task
    if (stage === "today") {
      setTasks((prev) => [newTask, ...prev]);
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, stage }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();

      if (stage === "today") {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      } else {
        toast("Task added to inbox.", "success");
      }
    } catch {
      if (stage === "today") {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
      toast("Couldn\u2019t add task. Try again.", "error");
    }
  }

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const willComplete = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: willComplete, status: willComplete ? "completed" : "active" }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: willComplete ? "completed" : "active" }),
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
        prev.map((t) =>
          t.id === id
            ? { ...t, completed: !willComplete, status: !willComplete ? "completed" : "active" }
            : t
        )
      );
      toast("Couldn\u2019t update task. Try again.", "error");
    }
  }

  async function handleDelete(id: string) {
    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Task deleted.", "success");
    } catch {
      setTasks(prev);
      toast("Couldn\u2019t delete task. Try again.", "error");
    }
  }

  async function handleUpdate(id: string, data: Partial<Task>) {
    const prev = tasks;
    // Optimistically remove from Today view (defer / won't do moves it away)
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks(prev);
      toast("Couldn\u2019t update task. Try again.", "error");
    }
  }

  async function handleAddSubTasks(parentId: string, steps: { title: string }[]) {
    const parent = tasks.find((t) => t.id === parentId);
    const stage = parent?.stage ?? "today";

    try {
      for (const step of steps) {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: step.title, parentId, stage }),
        });
        if (!res.ok) throw new Error();
      }
      await fetchTasks();
    } catch {
      toast("Couldn\u2019t add sub-tasks. Try again.", "error");
    }
  }

  // Overdue quick actions
  function handleDoToday(id: string) {
    handleUpdate(id, { scheduledDate: todayStr() });
    // Re-add to list since it's still "today" stage — refetch to be safe
    fetchTasks();
  }

  function handleLetGo(id: string) {
    handleUpdate(id, { status: "wont_do" });
  }

  // Derived data
  const todayTasks = tasks.filter((t) => t.stage === "today" && !isOverdue(t));
  const overdueTasks = tasks.filter(isOverdue);
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm text-white/90">Today</p>
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
        <p className="font-medium text-sm text-white/90">Today</p>
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
      <p className="font-medium text-sm text-white/90">Today</p>

      {/* Quick capture input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task..."
        maxLength={200}
        className="w-full px-3 py-2.5 text-sm border border-white/15 rounded-lg bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-colors"
      />

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-white/50">
            {completedCount} of {totalCount} done
          </p>
          <div className="h-1 w-full rounded-full bg-white/10">
            <div
              className="h-1 rounded-full bg-cove-accent transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Needs attention section (overdue tasks) */}
      {overdueTasks.length > 0 && (
        <div className="flex flex-col">
          <button
            onClick={toggleNeedsAttention}
            className="flex items-center gap-2 py-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${needsAttentionCollapsed ? "" : "rotate-90"}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Needs attention ({overdueTasks.length})</span>
          </button>

          {!needsAttentionCollapsed && (
            <div className="flex flex-col gap-1 pl-1">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm text-white/80 flex-1 truncate">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 relative">
                    <button
                      onClick={() => handleDoToday(task.id)}
                      aria-label="Do today"
                      title="Do today"
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDeferTaskId(deferTaskId === task.id ? null : task.id)}
                      aria-label="Defer"
                      title="Defer"
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => handleLetGo(task.id)}
                      aria-label="Let go"
                      title="Let go"
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70 hover:bg-cove-error/30 hover:text-white transition-colors"
                    >
                      Let go
                    </button>
                    {deferTaskId === task.id && (
                      <DeferPopover
                        onDefer={(data) => {
                          handleUpdate(task.id, data);
                          setDeferTaskId(null);
                        }}
                        onClose={() => setDeferTaskId(null)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today tasks list */}
      <div className="flex flex-col divide-y divide-white/10">
        {todayTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onAddSubTasks={handleAddSubTasks}
            compact
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-4 px-2">
          <p className="text-sm text-white/60 font-medium mb-1">No tasks for today</p>
          <p className="text-xs text-white/40 leading-relaxed">
            Type above and press Enter to add a task. Prefix with &quot;today: &quot; to add directly to today.
          </p>
        </div>
      )}

      {/* View all tasks link */}
      {onNavigateToTasks && (
        <button
          onClick={onNavigateToTasks}
          className="text-xs text-white/50 hover:text-white/80 transition-colors self-start mt-1"
        >
          View all tasks &rarr;
        </button>
      )}
    </div>
  );
}
