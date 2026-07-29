"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import CheckinForm, { WellnessCheckinData } from "@/components/wellness/CheckinForm";
import CompanionAvatar from "@/components/companion/CompanionAvatar";
import VoiceInput from "@/components/companion/VoiceInput";
import type { CompanionType } from "@/lib/companions";
import { notifyTasksChanged, onTasksChanged } from "@/lib/taskEvents";

/* ── Types ── */

interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  deadline?: string;
}

interface RoutineStep { id: string; title: string; }
interface RoutineLog { id: string; completedSteps: string[]; }
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

interface GamificationData {
  dailyStreak: { current: number; longest: number };
  weekActivity: { date: string; hit: boolean }[];
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
}

interface WellnessEntry {
  mood?: number | null;
  energy?: number | null;
  sleep?: number | null;
  date: string;
}

/* ── Helpers ── */

const LEVEL_NAMES: Record<number, string> = {
  1: "Seedling", 2: "Sprout", 3: "Sapling", 4: "Sapling",
  5: "Young Tree", 6: "Young Tree", 7: "Growing Tree", 8: "Growing Tree",
  9: "Strong Tree", 10: "Strong Tree", 11: "Ancient", 12: "Ancient",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Sparkline({ values, color, label }: { values: (number | null)[]; color: string; label: string }) {
  const max = 5;
  const valid = values.filter((v): v is number => v != null);
  const avgVal = valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : null;
  const widthPercent = avgVal ? (parseFloat(avgVal) / max) * 100 : 0;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-cove-muted">{label}</span>
        {avgVal && <span className="text-[11px] font-medium" style={{ color }}>{avgVal} avg</span>}
      </div>
      <div className="w-full h-3 rounded-full bg-cove-border/20 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${widthPercent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function DailyView() {
  const [data, setData] = useState<DailyData | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  const [companionType, setCompanionType] = useState<CompanionType>("fox");
  const [companionGreeting, setCompanionGreeting] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [captureValue, setCaptureValue] = useState("");
  const [captureSending, setCaptureSending] = useState(false);
  const [captureAck, setCaptureAck] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setError(false);
    try {
      const [dailyRes, gamRes, wellnessRes, greetingRes, settingsRes] = await Promise.all([
        fetch("/api/daily"),
        fetch("/api/gamification"),
        fetch("/api/wellness?days=7"),
        fetch("/api/companion/greeting"),
        fetch("/api/settings"),
      ]);

      if (!dailyRes.ok) throw new Error();
      setData(await dailyRes.json());

      if (gamRes.ok) setGamification(await gamRes.json());
      if (wellnessRes.ok) setWellnessHistory(await wellnessRes.json());
      if (greetingRes.ok) {
        const g = await greetingRes.json();
        setCompanionGreeting(g.greeting);
        if (g.companionType) setCompanionType(g.companionType);
      }
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        if (s.companionType) setCompanionType(s.companionType);
      }

      // Get display name
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setDisplayName(session?.user?.name?.split(" ")[0] ?? "");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh the daily card when tasks change in the pipeline or the drawer.
  useEffect(() => onTasksChanged(fetchData), [fetchData]);

  /* ── Handlers ── */

  async function handleTaskToggle(id: string) {
    if (!data) return;
    const task = data.tasks.find((t) => t.id === id);
    setData({
      ...data,
      tasks: data.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task?.completed }),
      });
      if (!res.ok) throw new Error();
      notifyTasksChanged();
    } catch {
      setData((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
      } : prev);
      toast("Couldn\u2019t update task. Try again.", "error");
    }
  }

  async function handleStepToggle(routineId: string, stepId: string, checked: boolean) {
    if (!data) return;
    setData({
      ...data,
      routines: data.routines.map((r) => {
        if (r.id !== routineId) return r;
        const log = r.logs[0];
        const currentSteps = log?.completedSteps ?? [];
        const nextSteps = checked ? [...currentSteps, stepId] : currentSteps.filter((id) => id !== stepId);
        return { ...r, logs: [{ id: log?.id ?? "temp", completedSteps: nextSteps }] };
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
    setData({ ...data, reminders: data.reminders.filter((r) => r.id !== id) });
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() }),
      });
      if (!res.ok) throw new Error();
      toast("Snoozed for 30 minutes.", "success");
    } catch {
      await fetchData();
      toast("Couldn\u2019t snooze reminder. Try again.", "error");
    }
  }

  async function handleQuickCapture(content: string, source: "text" | "voice" = "text") {
    if (!content.trim() || captureSending) return;
    setCaptureSending(true);
    try {
      const chatRes = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim(), history: [] }),
      });
      if (chatRes.ok) {
        const { reply, actionable } = await chatRes.json();
        if (actionable) {
          await fetch("/api/inbox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: content.trim(), source }),
          });
        }
        setCaptureAck(reply);
        setCaptureValue("");
        setTimeout(() => setCaptureAck(""), 4000);
      }
    } finally {
      setCaptureSending(false);
    }
  }

  /* ── Loading / Error ── */

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto p-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cove-border-light animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-lg bg-cove-border-light animate-pulse" />
            <div className="h-3 w-64 rounded-lg bg-cove-border-light animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-cove-card border border-cove-border-light p-5 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto gap-4 p-4">
        <div className="w-full rounded-2xl bg-cove-card border border-cove-border-light p-10 text-center">
          <p className="text-cove-muted text-lg font-medium">Couldn&apos;t load your daily view.</p>
          <button onClick={fetchData} className="mt-4 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completedTasks = data.tasks.filter((t) => t.completed).length;
  const totalTasks = data.tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Wellness sparkline data (last 7 days, oldest first)
  const sortedWellness = [...wellnessHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
  const moodValues = sortedWellness.map((w) => w.mood ?? null);
  const energyValues = sortedWellness.map((w) => w.energy ?? null);
  const sleepValues = sortedWellness.map((w) => w.sleep ?? null);
  const hasWellnessHistory = sortedWellness.length > 0;

  return (
    <div className="daily-view flex flex-col gap-6 max-w-3xl mx-auto p-2">

      {/* ── Companion Greeting ── */}
      <div className="flex items-center gap-3">
        <CompanionAvatar type={companionType} size="md" />
        <div>
          <h1 className="text-xl font-medium text-cove-charcoal tracking-tight">
            {getGreeting()}{displayName ? `, ${displayName}` : ""}
          </h1>
          {companionGreeting && (
            <p className="text-sm text-cove-muted mt-0.5">{companionGreeting}</p>
          )}
        </div>
      </div>

      {/* ── Quick Capture ── */}
      <div className="daily-capture ml-[60px]">
        {captureAck ? (
          <div className="flex items-center gap-2 text-sm text-cove-charcoal bg-cove-card rounded-2xl px-4 py-3 border border-cove-accent/10">
            <CompanionAvatar type={companionType} size="sm" />
            <span>{captureAck}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={captureValue}
              onChange={(e) => setCaptureValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickCapture(captureValue)}
              placeholder="What's on your mind?"
              disabled={captureSending}
              className="flex-1 bg-cove-card border border-cove-border-light rounded-2xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40 shadow-sm"
            />
            <VoiceInput onTranscript={(t) => handleQuickCapture(t, "voice")} disabled={captureSending} />
            <button
              onClick={() => handleQuickCapture(captureValue)}
              disabled={!captureValue.trim() || captureSending}
              className="w-9 h-9 rounded-xl bg-cove-accent text-white disabled:opacity-40 transition-opacity flex items-center justify-center shadow-sm"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Card Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tasks Card */}
        <section className="rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-cove-charcoal">Tasks</h2>
            {totalTasks > 0 && (
              <span className="text-[11px] text-white bg-cove-accent px-2 py-0.5 rounded-full">
                {completedTasks} of {totalTasks}
              </span>
            )}
          </div>
          {totalTasks > 0 && (
            <div className="h-1 bg-cove-border-light rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cove-accent to-cove-blue rounded-full transition-all duration-500" style={{ width: `${taskProgress}%` }} />
            </div>
          )}
          {data.tasks.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {data.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5" data-testid="daily-task">
                  <button
                    onClick={() => handleTaskToggle(task.id)}
                    className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all ${
                      task.completed ? "bg-cove-accent border-cove-accent" : "border-cove-border hover:border-cove-accent/50"
                    }`}
                    aria-label={`Toggle ${task.title}`}
                  >
                    {task.completed && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L4.5 9L10 3" /></svg>
                    )}
                  </button>
                  <span className={`text-[13px] ${task.completed ? "line-through text-cove-muted" : "text-cove-charcoal"}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cove-muted">No tasks for today. Enjoy the quiet.</p>
          )}
        </section>

        {/* Streak Card */}
        <section className="rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50">
          <h2 className="text-sm font-semibold text-cove-charcoal mb-3">Streak</h2>
          {gamification ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold text-cove-accent leading-none tracking-tight">
                  {gamification.dailyStreak.current}
                </span>
                <span className="text-sm text-cove-muted">days in a row</span>
              </div>
              {/* Week dots — checked-in days are filled; missed days get a soft
                  dash (gentle, never red); today is an open ring; future days
                  stay faint. */}
              {(() => {
                // The row is always Mon→Sun, so compare by column index rather
                // than parsing date strings (avoids UTC/local mismatches).
                const jsDay = new Date().getDay(); // 0=Sun … 6=Sat
                const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 … Sun=6
                return (
                  <div className="flex gap-1.5 mt-4">
                    {gamification.weekActivity.map((day, i) => {
                      const isToday = i === todayIdx;
                      const isFuture = i > todayIdx;
                      const missed = !day.hit && i < todayIdx;
                      return (
                        <div
                          key={i}
                          title={
                            day.hit
                              ? "Checked in"
                              : isToday
                              ? "Today — here whenever you're ready"
                              : isFuture
                              ? ""
                              : "No check-in that day"
                          }
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            day.hit
                              ? "bg-cove-accent"
                              : isToday
                              ? "border-[1.5px] border-cove-accent/45 bg-cove-accent/5"
                              : isFuture
                              ? "bg-cove-border-light/50"
                              : "bg-cove-border-light"
                          }`}
                        >
                          {day.hit && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L4.5 9L10 3" /></svg>
                          )}
                          {isToday && !day.hit && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cove-accent/60" />
                          )}
                          {missed && (
                            <span className="w-2.5 h-[2px] rounded-full bg-cove-muted/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="flex gap-1.5 mt-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="w-7 text-center text-[9px] text-cove-muted">{d}</div>
                ))}
              </div>
              {/* XP bar */}
              <div className="mt-4 bg-cove-offwhite rounded-xl p-3">
                <div className="flex justify-between text-[11px] text-cove-muted mb-1.5">
                  <span className="font-medium">Level {gamification.level} — {LEVEL_NAMES[gamification.level] ?? "Legend"}</span>
                  <span>{gamification.xpInLevel} / {gamification.xpToNextLevel} XP</span>
                </div>
                <div className="h-1.5 bg-cove-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cove-accent to-cove-blue rounded-full transition-all duration-500"
                    style={{ width: `${(gamification.xpInLevel / gamification.xpToNextLevel) * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-cove-muted">Loading streak data...</p>
          )}
        </section>

        {/* Wellness Trends Card */}
        <section className="rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-cove-charcoal">Wellness</h2>
            <span className="text-[11px] text-cove-muted">past 7 days</span>
          </div>
          {hasWellnessHistory ? (
            <>
              <Sparkline values={moodValues} color="#6B8F71" label="Mood" />
              <Sparkline values={energyValues} color="#C4A055" label="Energy" />
              <Sparkline values={sleepValues} color="#7EAAA0" label="Sleep" />
            </>
          ) : data.wellness ? (
            <div className="text-sm text-cove-charcoal space-y-1">
              {data.wellness.mood != null && <p>Mood: {data.wellness.mood}/5</p>}
              {data.wellness.energy != null && <p>Energy: {data.wellness.energy}/5</p>}
              {data.wellness.sleep != null && <p>Sleep: {data.wellness.sleep}/5</p>}
            </div>
          ) : (
            <CheckinForm onSubmit={handleWellnessSubmit} />
          )}
        </section>

        {/* Companion Card — sizes to its message instead of stretching to match
            the tall wellness check-in beside it. */}
        <section className="self-start rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50 flex flex-col">
          <h2 className="text-sm font-semibold text-cove-charcoal mb-3">Companion</h2>
          <div className="bg-gradient-to-br from-cove-offwhite to-cove-accent/5 rounded-xl p-4 text-[13px] text-cove-charcoal/80 leading-relaxed">
            {companionGreeting ? `"${companionGreeting}"` : "Your companion is here for you."}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <CompanionAvatar type={companionType} size="sm" />
            <span className="text-[11px] text-cove-muted capitalize">{companionType} · just now</span>
          </div>
        </section>

        {/* Routines Card (full width) */}
        {data.routines.length > 0 && (
          <section className="md:col-span-2 rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-cove-charcoal">Routines</h2>
              <span className="text-[11px] text-cove-muted">
                {data.routines.filter((r) => {
                  const done = r.logs[0]?.completedSteps?.length ?? 0;
                  return done >= r.steps.length && r.steps.length > 0;
                }).length} of {data.routines.length} completed today
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {data.routines.map((routine) => {
                const completedSteps = routine.logs[0]?.completedSteps ?? [];
                const progress = routine.steps.length > 0 ? (completedSteps.length / routine.steps.length) * 100 : 0;
                const isDone = progress >= 100;
                return (
                  <div key={routine.id} className="flex-1 min-w-[160px] bg-cove-offwhite rounded-xl p-3.5" data-testid="daily-routine">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-medium text-cove-charcoal">{routine.name}</span>
                      <span className={`text-[10px] font-medium ${isDone ? "text-cove-accent" : "text-cove-muted"}`}>
                        {isDone ? "Done" : `${completedSteps.length} of ${routine.steps.length}`}
                      </span>
                    </div>
                    <div className="h-[5px] bg-cove-border-light rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-cove-accent" : "bg-cove-amber"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reminders Card (full width) */}
        {data.reminders.length > 0 && (
          <section className="md:col-span-2 rounded-2xl bg-cove-card p-5 shadow-sm border border-cove-border-light/50">
            <h2 className="text-sm font-semibold text-cove-charcoal mb-4">Upcoming</h2>
            <div className="flex gap-3 overflow-x-auto">
              {data.reminders.slice(0, 4).map((reminder, i) => {
                const colors = ["#7EAAA0", "#C4A055", "#A08BA0", "#6B8F71"];
                return (
                  <div key={reminder.id} className="flex items-center gap-2.5 bg-cove-offwhite rounded-xl px-4 py-3 flex-1 min-w-[140px]" data-testid="daily-reminder">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="text-[13px] text-cove-charcoal truncate">{reminder.title}</span>
                    <button
                      onClick={() => handleSnooze(reminder.id)}
                      className="text-[10px] text-cove-muted hover:text-cove-charcoal ml-auto shrink-0"
                      aria-label={`Snooze ${reminder.title}`}
                    >
                      Snooze
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
