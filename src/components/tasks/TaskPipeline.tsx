"use client";

import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { notifyTasksChanged, onTasksChanged } from "@/lib/taskEvents";
import TaskItem, { Task } from "./TaskItem";
import { DeferPopover } from "./TaskActions";

interface TaskPipelineProps {
  stage: string; // "inbox" | "today" | "upcoming" | "someday" | "done"
}

type PriorityFilter = "high" | "medium" | "low";
type EnergyFilter = "low energy" | "moderate" | "high focus";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function isOverdue(task: Task): boolean {
  if (task.status !== "active") return false;
  const today = todayStr();
  if (task.scheduledDate && task.scheduledDate < today) return true;
  if (task.deadline && task.deadline < today) return true;
  return false;
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const PRIORITY_OPTIONS: { label: string; value: PriorityFilter }[] = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const ENERGY_OPTIONS: { label: string; value: EnergyFilter }[] = [
  { label: "Low energy", value: "low energy" },
  { label: "Moderate", value: "moderate" },
  { label: "High focus", value: "high focus" },
];

export default function TaskPipeline({ stage }: TaskPipelineProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priorityFilters, setPriorityFilters] = useState<Set<PriorityFilter>>(new Set());
  const [energyFilters, setEnergyFilters] = useState<Set<EnergyFilter>>(new Set());
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
      // "all" omits the stage filter → every active task, across buckets.
      const res = await fetch(stage === "all" ? "/api/tasks" : `/api/tasks?stage=${stage}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Refetch when any other task view (drawer, Daily card) changes a task.
  useEffect(() => onTasksChanged(fetchTasks), [fetchTasks]);

  // --- Filters ---

  function togglePriority(p: PriorityFilter) {
    setPriorityFilters((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function toggleEnergy(e: EnergyFilter) {
    setEnergyFilters((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  }

  function applyFilters(list: Task[]): Task[] {
    let filtered = list;
    if (priorityFilters.size > 0) {
      filtered = filtered.filter((t) => priorityFilters.has(t.priority as PriorityFilter));
    }
    if (energyFilters.size > 0) {
      filtered = filtered.filter((t) => energyFilters.has(t.energyLevel as EnergyFilter));
    }
    return filtered;
  }

  // --- CRUD handlers ---

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputValue.trim()) {
      handleAdd(inputValue.trim());
      setInputValue("");
    }
  }

  async function handleAdd(title: string) {
    // From the "All" view, new tasks land in the inbox bucket.
    const addStage = stage === "all" ? "inbox" : stage;
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title,
      completed: false,
      status: "active",
      stage: addStage,
      priority: "medium",
      sortOrder: 0,
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, stage: addStage }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      notifyTasksChanged();
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      toast("Couldn\u2019t add task. Try again.", "error");
    }
  }

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id) ??
      tasks.flatMap((t) => t.subtasks ?? []).find((s) => s.id === id);
    if (!task) return;
    const willComplete = !task.completed;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, completed: willComplete, status: willComplete ? "completed" : "active" };
        }
        if (t.subtasks?.some((s) => s.id === id)) {
          return {
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === id ? { ...s, completed: willComplete, status: willComplete ? "completed" : "active" } : s
            ),
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: willComplete ? "completed" : "active" }),
      });
      if (!res.ok) throw new Error();
      notifyTasksChanged();
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
        prev.map((t) => {
          if (t.id === id) {
            return { ...t, completed: !willComplete, status: !willComplete ? "completed" : "active" };
          }
          if (t.subtasks?.some((s) => s.id === id)) {
            return {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === id ? { ...s, completed: !willComplete, status: !willComplete ? "completed" : "active" } : s
              ),
            };
          }
          return t;
        })
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
      notifyTasksChanged();
      toast("Task deleted.", "success");
    } catch {
      setTasks(prev);
      toast("Couldn\u2019t delete task. Try again.", "error");
    }
  }

  async function handleUpdate(id: string, data: Partial<Task>) {
    const prev = tasks;
    // For updates that change stage, remove from current view
    if (data.stage && data.stage !== stage) {
      setTasks((curr) => curr.filter((t) => t.id !== id));
    } else {
      setTasks((curr) =>
        curr.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      notifyTasksChanged();
    } catch {
      setTasks(prev);
      toast("Couldn\u2019t update task. Try again.", "error");
    }
  }

  async function handleAddSubTasks(parentId: string, steps: { title: string }[]) {
    const parent = tasks.find((t) => t.id === parentId);
    const parentStage = parent?.stage ?? stage;

    try {
      for (const step of steps) {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: step.title, parentId, stage: parentStage }),
        });
        if (!res.ok) throw new Error();
      }
      await fetchTasks();
      notifyTasksChanged();
    } catch {
      toast("Couldn\u2019t add sub-tasks. Try again.", "error");
    }
  }

  // --- Needs attention helpers ---

  function toggleNeedsAttention() {
    setNeedsAttentionCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("cove-needs-attention-collapsed", String(next));
      return next;
    });
  }

  function handleDoToday(id: string) {
    handleUpdate(id, { scheduledDate: todayStr() });
    fetchTasks();
  }

  function handleLetGo(id: string) {
    handleUpdate(id, { status: "wont_do", completed: true });
  }

  // --- Derived data ---

  const filtered = applyFilters(tasks);

  // Today view
  const todayTasks = filtered.filter((t) => t.stage === "today" && !isOverdue(t));
  const overdueTasks = tasks.filter(isOverdue); // Don't filter overdue by priority/energy
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;

  // Upcoming view — group by date
  const upcomingGroups: { date: string; label: string; tasks: Task[] }[] = [];
  if (stage === "upcoming") {
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.scheduledDate || a.deadline || "9999-12-31";
      const dateB = b.scheduledDate || b.deadline || "9999-12-31";
      return dateA.localeCompare(dateB);
    });
    const groupMap = new Map<string, Task[]>();
    for (const task of sorted) {
      const key = task.scheduledDate || task.deadline || "unscheduled";
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(task);
    }
    for (const [date, groupTasks] of Array.from(groupMap.entries())) {
      upcomingGroups.push({
        date,
        label: date === "unscheduled" ? "Unscheduled" : formatDateHeader(date),
        tasks: groupTasks,
      });
    }
  }

  // Done view — split by status
  const completedTasks = filtered.filter((t) => t.status === "completed");
  const wontDoTasks = filtered.filter((t) => t.status === "wont_do");

  // All view — every active task, grouped by its bucket
  const ALL_GROUP_ORDER = ["today", "upcoming", "someday", "inbox"];
  const ALL_GROUP_LABELS: Record<string, string> = {
    today: "Today",
    upcoming: "Upcoming",
    someday: "Someday",
    inbox: "Inbox",
  };
  const allGroups =
    stage === "all"
      ? ALL_GROUP_ORDER.map((s) => ({
          stage: s,
          label: ALL_GROUP_LABELS[s],
          tasks: filtered.filter((t) => t.stage === s),
        })).filter((g) => g.tasks.length > 0)
      : [];

  // --- Empty state messages ---

  const emptyMessages: Record<string, string> = {
    all: "No tasks yet. Add one above to get started.",
    inbox: "Your inbox is clear \u2014 nothing unprocessed",
    today: "A clear day. Add tasks from your inbox, or enjoy the space.",
    upcoming: "Nothing scheduled for the coming days",
    someday: "Nothing deferred \u2014 everything has a place",
    done: "No completed tasks yet",
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-cove-offwhite animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 px-4">
        <p className="text-sm text-cove-muted">Couldn&apos;t load tasks.</p>
        <button
          onClick={fetchTasks}
          className="text-sm text-cove-accent hover:text-cove-accent/80 underline transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quick capture input (not shown on Done view) */}
      {stage !== "done" && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          maxLength={200}
          className="w-full px-3 py-2.5 text-sm border border-cove-border rounded-lg bg-cove-card text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-2 focus:ring-cove-accent/20 focus:border-cove-accent/30 transition-colors"
        />
      )}

      {/* Filter bar */}
      <div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
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
            className={`transition-transform ${filtersOpen ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Filters</span>
          {(priorityFilters.size > 0 || energyFilters.size > 0) && (
            <span className="h-1.5 w-1.5 rounded-full bg-cove-accent" />
          )}
        </button>

        {filtersOpen && (
          <div className="mt-2 flex flex-col gap-2">
            {/* Priority filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-cove-muted w-14 shrink-0">Priority</span>
              <div className="flex flex-wrap gap-1">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => togglePriority(opt.value)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      priorityFilters.has(opt.value)
                        ? "bg-cove-accent/10 text-cove-accent"
                        : "bg-cove-offwhite text-cove-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-cove-muted w-14 shrink-0">Energy</span>
              <div className="flex flex-wrap gap-1">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleEnergy(opt.value)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      energyFilters.has(opt.value)
                        ? "bg-cove-accent/10 text-cove-accent"
                        : "bg-cove-offwhite text-cove-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== ALL VIEW ========== */}
      {stage === "all" && (
        <>
          {filtered.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.all}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {allGroups.map((group) => (
                <div key={group.stage}>
                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-cove-muted mb-1.5 px-2">
                    {group.label}
                    <span className="ml-1.5 text-cove-muted/60">{group.tasks.length}</span>
                  </h3>
                  <div className="flex flex-col divide-y divide-cove-border/30">
                    {group.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onAddSubTasks={handleAddSubTasks}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== INBOX VIEW ========== */}
      {stage === "inbox" && (
        <>
          {filtered.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.inbox}</p>
          ) : (
            <div className="flex flex-col divide-y divide-cove-border/30">
              {filtered.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onAddSubTasks={handleAddSubTasks}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== TODAY VIEW ========== */}
      {stage === "today" && (
        <>
          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-cove-muted">
                {completedCount} of {totalCount} done today
              </p>
              <div className="h-1.5 w-full rounded-full bg-cove-offwhite">
                <div
                  className="h-1.5 rounded-full bg-cove-accent transition-all duration-300"
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
                className="flex items-center gap-2 py-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
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
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-amber-50"
                    >
                      <span className="text-sm text-cove-charcoal flex-1 truncate">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 relative">
                        <button
                          onClick={() => handleDoToday(task.id)}
                          aria-label="Do today"
                          title="Do today"
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-cove-offwhite text-cove-charcoal hover:bg-cove-accent/10 hover:text-cove-accent transition-colors"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setDeferTaskId(deferTaskId === task.id ? null : task.id)}
                          aria-label="Defer"
                          title="Defer"
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-cove-offwhite text-cove-charcoal hover:bg-cove-accent/10 hover:text-cove-accent transition-colors"
                        >
                          Defer
                        </button>
                        <button
                          onClick={() => handleLetGo(task.id)}
                          aria-label="Let go"
                          title="Let go"
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-cove-offwhite text-cove-charcoal hover:bg-cove-error/20 hover:text-cove-error transition-colors"
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

          {/* Today tasks */}
          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.today}</p>
          ) : (
            <div className="flex flex-col divide-y divide-cove-border/30">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onAddSubTasks={handleAddSubTasks}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== UPCOMING VIEW ========== */}
      {stage === "upcoming" && (
        <>
          {upcomingGroups.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.upcoming}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {upcomingGroups.map((group) => (
                <div key={group.date} className="flex flex-col">
                  {/* Date header */}
                  <div className="flex items-center gap-2 pb-1.5 border-b border-cove-border/20">
                    <h3 className="text-xs font-medium text-cove-charcoal">{group.label}</h3>
                    <span className="text-[10px] text-cove-muted">{group.tasks.length}</span>
                  </div>

                  {/* Tasks for this date */}
                  <div className="flex flex-col divide-y divide-cove-border/30">
                    {group.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onAddSubTasks={handleAddSubTasks}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== SOMEDAY VIEW ========== */}
      {stage === "someday" && (
        <>
          {filtered.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.someday}</p>
          ) : (
            <div className="flex flex-col divide-y divide-cove-border/30">
              {filtered.map((task) => (
                <div key={task.id} className="group/someday flex items-center">
                  <div className="flex-1 min-w-0">
                    <TaskItem
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                      onAddSubTasks={handleAddSubTasks}
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate(task.id, { stage: "today", scheduledDate: todayStr() })
                    }
                    className="shrink-0 opacity-0 group-hover/someday:opacity-100 px-3 py-1.5 text-[10px] font-medium rounded-lg bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20 transition-all mr-2"
                  >
                    Move to Today
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== DONE VIEW ========== */}
      {stage === "done" && (
        <>
          {completedTasks.length === 0 && wontDoTasks.length === 0 ? (
            <p className="text-sm text-cove-muted text-center py-8">{emptyMessages.done}</p>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Completed section */}
              {completedTasks.length > 0 && (
                <div className="flex flex-col">
                  <h3 className="text-xs font-medium text-cove-charcoal pb-1.5 border-b border-cove-border/20">
                    Completed ({completedTasks.length})
                  </h3>
                  <div className="flex flex-col divide-y divide-cove-border/30">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="group/done flex items-center">
                        <div className="flex-1 min-w-0">
                          <TaskItem
                            task={task}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onAddSubTasks={handleAddSubTasks}
                          />
                        </div>
                        <div className="shrink-0 flex items-center gap-2 mr-2">
                          {task.completedAt && (
                            <span className="text-[10px] text-cove-muted">
                              {new Date(task.completedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          <button
                            onClick={() =>
                              handleUpdate(task.id, { status: "active", stage: "inbox", completed: false })
                            }
                            className="opacity-0 group-hover/done:opacity-100 px-3 py-1.5 text-[10px] font-medium rounded-lg bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20 transition-all"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Won't Do section */}
              {wontDoTasks.length > 0 && (
                <div className="flex flex-col">
                  <h3 className="text-xs font-medium text-cove-muted pb-1.5 border-b border-cove-border/20">
                    Won&apos;t Do ({wontDoTasks.length})
                  </h3>
                  <div className="flex flex-col divide-y divide-cove-border/30">
                    {wontDoTasks.map((task) => (
                      <div key={task.id} className="group/wontdo flex items-center">
                        <div className="flex-1 min-w-0">
                          <TaskItem
                            task={task}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onAddSubTasks={handleAddSubTasks}
                          />
                        </div>
                        <div className="shrink-0 flex items-center gap-2 mr-2">
                          {task.completedAt && (
                            <span className="text-[10px] text-cove-muted">
                              {new Date(task.completedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          <button
                            onClick={() =>
                              handleUpdate(task.id, { status: "active", stage: "inbox", completed: false })
                            }
                            className="opacity-0 group-hover/wontdo:opacity-100 px-3 py-1.5 text-[10px] font-medium rounded-lg bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20 transition-all"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
