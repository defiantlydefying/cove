"use client";

import { useEffect, useState, useCallback } from "react";
import CheckinForm, { WellnessCheckinData } from "@/components/wellness/CheckinForm";

interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  deadline?: string;
}

interface RoutineStep {
  id: string;
  title: string;
}

interface RoutineLog {
  id: string;
  completedSteps: string[];
}

interface DailyRoutine {
  id: string;
  name: string;
  steps: RoutineStep[];
  logs: RoutineLog[];
}

interface DailyReminder {
  id: string;
  title: string;
  message?: string | null;
  type: string;
}

interface WellnessCheckin {
  id: string;
  mood?: number | null;
  energy?: number | null;
  sleep?: number | null;
  notes?: string | null;
}

interface DailyData {
  tasks: DailyTask[];
  routines: DailyRoutine[];
  wellness: WellnessCheckin | null;
  reminders: DailyReminder[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DailyView() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/daily");
      const json = await res.json();
      setData(json);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleTaskToggle(id: string) {
    if (!data) return;
    setData({
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });

    try {
      const task = data.tasks.find((t) => t.id === id);
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task?.completed }),
      });
    } catch {
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
              ),
            }
          : prev
      );
    }
  }

  async function handleStepToggle(
    routineId: string,
    stepId: string,
    checked: boolean
  ) {
    if (!data) return;

    setData({
      ...data,
      routines: data.routines.map((r) => {
        if (r.id !== routineId) return r;
        const log = r.logs[0];
        const currentSteps = log?.completedSteps ?? [];
        const nextSteps = checked
          ? [...currentSteps, stepId]
          : currentSteps.filter((id) => id !== stepId);
        return {
          ...r,
          logs: [{ id: log?.id ?? "temp", completedSteps: nextSteps }],
        };
      }),
    });

    try {
      await fetch(`/api/routines/${routineId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, checked }),
      });
    } catch {
      // revert on error
      await fetchData();
    }
  }

  async function handleWellnessSubmit(checkinData: WellnessCheckinData) {
    try {
      await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinData),
      });
      await fetchData();
    } catch {
      // silently handle
    }
  }

  async function handleSnooze(id: string) {
    if (!data) return;
    const snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    setData({
      ...data,
      reminders: data.reminders.filter((r) => r.id !== id),
    });

    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
    } catch {
      await fetchData();
    }
  }

  if (loading) {
    return <p className="text-sm text-cove-muted">Loading daily view...</p>;
  }

  if (!data) {
    return <p className="text-sm text-cove-muted">Failed to load daily view.</p>;
  }

  const hasTasks = data.tasks.length > 0;
  const hasRoutines = data.routines.length > 0;
  const hasReminders = data.reminders.length > 0;
  const hasWellness = true; // always show wellness section
  const hasAnything = hasTasks || hasRoutines || hasReminders || data.wellness;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-cove-charcoal mb-6">
          {getGreeting()}
        </h1>
        <div className="w-full rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-10 text-center">
          <p className="text-cove-muted text-lg font-medium">
            All caught up! Nothing on your plate today.
          </p>
          <p className="text-cove-muted text-sm mt-2">
            Enjoy your free time or add something new.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-cove-charcoal">
        {getGreeting()}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tasks Card */}
        {hasTasks && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-cove-accent">
            <h2 className="font-semibold text-cove-charcoal mb-3">Tasks</h2>
            <div className="flex flex-col gap-2">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2"
                  data-testid="daily-task"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id)}
                    aria-label={`Toggle ${task.title}`}
                    className="shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      {task.priority === "high" && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-red-500" title="High priority" data-testid="priority-high" />
                      )}
                      {task.priority === "low" && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-gray-400" title="Low priority" data-testid="priority-low" />
                      )}
                      <span
                        className={
                          task.completed
                            ? "line-through text-cove-muted text-sm"
                            : "text-cove-charcoal text-sm"
                        }
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.deadline && (
                      <span className="text-xs text-cove-muted mt-0.5" data-testid="task-deadline">
                        {task.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Routines Card */}
        {hasRoutines && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-cove-blue">
            <h2 className="font-semibold text-cove-charcoal mb-3">Routines</h2>
            <div className="flex flex-col gap-4">
              {data.routines.map((routine) => {
                const completedSteps = routine.logs[0]?.completedSteps ?? [];
                const progress = routine.steps.length > 0
                  ? Math.round((completedSteps.length / routine.steps.length) * 100)
                  : 0;
                return (
                  <div key={routine.id} data-testid="daily-routine">
                    <h3 className="font-medium text-sm text-cove-charcoal mb-1">
                      {routine.name}
                    </h3>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-cove-border-light mb-2">
                      <div
                        className="h-1.5 rounded-full bg-cove-blue transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      {routine.steps.map((step) => {
                        const checked = completedSteps.includes(step.id);
                        return (
                          <label
                            key={step.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                handleStepToggle(
                                  routine.id,
                                  step.id,
                                  e.target.checked
                                )
                              }
                              aria-label={`Toggle ${step.title}`}
                            />
                            <span
                              className={
                                checked
                                  ? "line-through text-cove-muted"
                                  : "text-cove-charcoal"
                              }
                            >
                              {step.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Wellness Card */}
        {hasWellness && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-green-400">
            <h2 className="font-semibold text-cove-charcoal mb-3">
              How are you feeling?
            </h2>
            {data.wellness ? (
              <div className="text-sm text-cove-charcoal" data-testid="wellness-summary">
                <div className="flex gap-4">
                  {data.wellness.mood != null && (
                    <span>Mood: {data.wellness.mood}/5</span>
                  )}
                  {data.wellness.energy != null && (
                    <span>Energy: {data.wellness.energy}/5</span>
                  )}
                  {data.wellness.sleep != null && (
                    <span>Sleep: {data.wellness.sleep}/5</span>
                  )}
                </div>
                {data.wellness.notes && (
                  <p className="mt-1 text-cove-muted">{data.wellness.notes}</p>
                )}
              </div>
            ) : (
              <CheckinForm onSubmit={handleWellnessSubmit} />
            )}
          </section>
        )}

        {/* Reminders Card */}
        {hasReminders && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-amber-400">
            <h2 className="font-semibold text-cove-charcoal mb-3">Reminders</h2>
            <div className="flex flex-col gap-2">
              {data.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between"
                  data-testid="daily-reminder"
                >
                  <div>
                    <span className="text-sm text-cove-charcoal">
                      {reminder.title}
                    </span>
                    {reminder.message && (
                      <p className="text-xs text-cove-muted">{reminder.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSnooze(reminder.id)}
                    className="text-xs text-cove-muted hover:text-cove-charcoal ml-3 shrink-0"
                    aria-label={`Snooze ${reminder.title}`}
                  >
                    Snooze
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
