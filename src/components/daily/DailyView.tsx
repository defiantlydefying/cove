"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatScheduleSummary } from "@/lib/reminder-presets";
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
  scheduledTime?: string | null;
  intervalMinutes?: number | null;
  activeDays?: string;
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

const MOOD_LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DailyView() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/daily");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
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
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task?.completed }),
      });
      if (!res.ok) throw new Error();
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
      toast("Couldn\u2019t update task. Try again.", "error");
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
      const res = await fetch(`/api/routines/${routineId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, checked }),
      });
      if (!res.ok) throw new Error();
    } catch {
      await fetchData();
      toast("Couldn\u2019t save step progress. Try again.", "error");
    }
  }

  async function handleWellnessSubmit(checkinData: WellnessCheckinData) {
    try {
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinData),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      toast("Check-in saved.", "success");
    } catch {
      toast("Couldn\u2019t save check-in. Try again.", "error");
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
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
      if (!res.ok) throw new Error();
      toast("Snoozed for 30 minutes.", "success");
    } catch {
      await fetchData();
      toast("Couldn\u2019t snooze reminder. Try again.", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="h-8 w-48 rounded-lg bg-cove-border-light animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-cove-card border border-cove-border-light p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-cove-charcoal">
          {getGreeting()}
        </h1>
        <div className="w-full rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-10 text-center">
          <p className="text-cove-muted text-lg font-medium">
            Couldn&apos;t load your daily view.
          </p>
          <p className="text-cove-muted text-sm mt-2">
            Check your connection and try again.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasTasks = data.tasks.length > 0;
  const hasRoutines = data.routines.length > 0;
  const hasReminders = data.reminders.length > 0;
  const hasWellness = true; // always show wellness section
  const hasAnything = hasTasks || hasRoutines || hasReminders || data.wellness;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-cove-charcoal mb-6">
          {getGreeting()}
        </h1>
        <div className="w-full rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-10 text-center">
          <p className="text-cove-charcoal text-lg font-medium mb-2">
            A clean slate
          </p>
          <p className="text-cove-muted text-sm leading-relaxed max-w-md mx-auto">
            Nothing scheduled for today. You can add tasks from the sidebar, set up routines from the Routines tab, or just enjoy the quiet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-cove-charcoal">
        {getGreeting()}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tasks Card */}
        {hasTasks && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-cove-sage">
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
                        <span className="shrink-0 inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cove-amber" aria-hidden="true" />
                          <span className="sr-only">High priority</span>
                        </span>
                      )}
                      {task.priority === "low" && (
                        <span className="shrink-0 inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cove-muted" aria-hidden="true" />
                          <span className="sr-only">Low priority</span>
                        </span>
                      )}
                      <span
                        className={`break-words ${
                          task.completed
                            ? "line-through text-cove-muted text-sm"
                            : "text-cove-charcoal text-sm"
                        }`}
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
                    <h3 className="font-medium text-sm text-cove-charcoal mb-1 break-words">
                      {routine.name}
                    </h3>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-cove-border-light mb-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${routine.name} progress`}>
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
                              className={`break-words ${
                                checked
                                  ? "line-through text-cove-muted"
                                  : "text-cove-charcoal"
                              }`}
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
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-cove-accent">
            <h2 className="font-semibold text-cove-charcoal mb-3">
              How are you feeling?
            </h2>
            {data.wellness ? (
              <div className="text-sm text-cove-charcoal" data-testid="wellness-summary">
                <div className="flex gap-4 flex-wrap">
                  {data.wellness.mood != null && (
                    <span>Mood: {MOOD_LABELS[data.wellness.mood] ?? data.wellness.mood}/5</span>
                  )}
                  {data.wellness.energy != null && (
                    <span>Energy: {MOOD_LABELS[data.wellness.energy] ?? data.wellness.energy}/5</span>
                  )}
                  {data.wellness.sleep != null && (
                    <span>Sleep: {MOOD_LABELS[data.wellness.sleep] ?? data.wellness.sleep}/5</span>
                  )}
                </div>
                {data.wellness.notes && (
                  <p className="mt-1 text-cove-muted break-words">{data.wellness.notes}</p>
                )}
              </div>
            ) : (
              <CheckinForm onSubmit={handleWellnessSubmit} />
            )}
          </section>
        )}

        {/* Reminders Card */}
        {hasReminders && (
          <section className="rounded-2xl bg-cove-card border border-cove-border-light shadow-sm p-5 border-l-4 border-l-cove-amber">
            <h2 className="font-semibold text-cove-charcoal mb-3">Reminders</h2>
            <div className="flex flex-col gap-2">
              {data.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between gap-2"
                  data-testid="daily-reminder"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-cove-charcoal break-words">
                      {reminder.title}
                    </span>
                    {reminder.scheduledTime && (
                      <p className="text-xs text-cove-muted">
                        {formatScheduleSummary(reminder.scheduledTime, reminder.intervalMinutes, reminder.activeDays)}
                      </p>
                    )}
                    {reminder.message && (
                      <p className="text-xs text-cove-muted break-words">{reminder.message}</p>
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
