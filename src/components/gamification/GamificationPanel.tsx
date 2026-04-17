"use client";

import { useEffect, useState } from "react";
import StreakCard, { ModuleStreak } from "./StreakCard";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Stats {
  tasksCompleted: number;
  focusSessions: number;
  habitChecks: number;
  wellnessCheckins: number;
}

interface DailyStreak {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

interface WeekDay {
  date: string;
  hit: boolean;
}

interface GamificationData {
  dailyStreak: DailyStreak;
  weekActivity: WeekDay[];
  weekStartDate: string;
  modules: Record<string, { current: number; longest: number; week: boolean[]; totalXp: number }>;
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  stats: Stats;
  achievements: Achievement[];
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Seedling",
  2: "Sprout",
  3: "Sapling",
  4: "Growing",
  5: "Blooming",
  6: "Thriving",
  7: "Flourishing",
  8: "Radiant",
  9: "Mighty",
  10: "Legendary",
};

function getLevelTitle(level: number): string {
  if (level >= 10) return LEVEL_TITLES[10];
  return LEVEL_TITLES[level] || `Level ${level}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTodayWeekdayIndex(): number {
  // Monday = 0, Sunday = 6
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

const MODULE_ORDER = ["tasks", "routines", "wellness", "focus", "habits"];

export default function GamificationPanel() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  async function fetchData() {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/gamification");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-xl bg-cove-border-light animate-pulse" />
        <div className="h-32 rounded-xl bg-cove-border-light animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-cove-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
        <p className="text-cove-muted">Couldn&apos;t load progress data.</p>
        <button
          onClick={fetchData}
          className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const unlockedCount = data.achievements.filter((a) => a.unlocked).length;
  const totalCount = data.achievements.length;
  const levelProgress = (data.xpInLevel / data.xpToNextLevel) * 100;
  const todayIdx = getTodayWeekdayIndex();
  const weekHits = data.weekActivity.filter((d) => d.hit).length;

  // Finch-inspired encouraging copy
  const streakMessage = getStreakMessage(data.dailyStreak.current, data.weekActivity, todayIdx);

  return (
    <div className="flex flex-col gap-6">
      {/* Daily Streak hero */}
      <div className="rounded-2xl border border-cove-accent/30 bg-gradient-to-br from-cove-accent/10 to-cove-accent/5 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-cove-accent uppercase tracking-wider mb-1">
              Daily Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-cove-accent tabular-nums">
                {data.dailyStreak.current}
              </span>
              <span className="text-lg text-cove-muted">
                day{data.dailyStreak.current !== 1 ? "s" : ""}
              </span>
            </div>
            {data.dailyStreak.longest > 0 && (
              <p className="text-xs text-cove-muted mt-1">
                Best: {data.dailyStreak.longest} day{data.dailyStreak.longest !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-cove-muted mb-1">This week</p>
            <p className="text-2xl font-bold text-cove-charcoal tabular-nums">
              {weekHits}<span className="text-sm text-cove-muted">/7</span>
            </p>
          </div>
        </div>

        {/* Week view (Mon-Sun) */}
        <div className="flex gap-2 mb-3" aria-label="This week's activity">
          {data.weekActivity.map((day, i) => {
            const isToday = i === todayIdx;
            const isFuture = i > todayIdx;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-full h-10 rounded-xl flex items-center justify-center transition-all ${
                    day.hit
                      ? "bg-cove-accent text-white shadow-sm"
                      : isFuture
                      ? "bg-cove-border/20"
                      : "bg-cove-offwhite border border-cove-border/40"
                  } ${isToday ? "ring-2 ring-cove-accent ring-offset-2 ring-offset-transparent" : ""}`}
                  aria-label={`${DAY_LABELS[i]}${day.hit ? " — active" : ""}`}
                >
                  {day.hit && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-cove-accent" : "text-cove-muted"
                  }`}
                >
                  {DAY_LABELS[i].slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-cove-muted text-center leading-relaxed">
          {streakMessage}
        </p>
      </div>

      {/* Level card */}
      <div className="rounded-xl border border-cove-border bg-cove-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-cove-muted mb-0.5">Level {data.level}</p>
            <h2 className="text-xl font-bold text-cove-accent">
              {getLevelTitle(data.level)}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cove-amber tabular-nums">
              {data.totalXp.toLocaleString()}
            </p>
            <p className="text-[11px] text-cove-muted">Total XP</p>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="relative">
          <div className="w-full h-3 bg-cove-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cove-accent to-cove-accent-hover rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-cove-muted">
              {data.xpInLevel} / {data.xpToNextLevel} XP
            </span>
            <span className="text-[10px] text-cove-muted">
              Next: {getLevelTitle(data.level + 1)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-cove-charcoal mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Tasks Done" value={data.stats.tasksCompleted} color="text-cove-blue" />
          <StatCard label="Focus Sessions" value={data.stats.focusSessions} color="text-cove-amber" />
          <StatCard label="Habit Checks" value={data.stats.habitChecks} color="text-cove-accent" />
          <StatCard label="Wellness Logs" value={data.stats.wellnessCheckins} color="text-cove-heather" />
        </div>
      </div>

      {/* Per-module streaks */}
      <div>
        <h2 className="text-sm font-semibold text-cove-charcoal mb-3">Module Streaks</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_ORDER.map((type) => {
            const m = data.modules[type];
            if (!m) return null;
            const streak: ModuleStreak = {
              type,
              current: m.current,
              longest: m.longest,
              week: m.week,
              totalXp: m.totalXp,
            };
            return <StreakCard key={type} streak={streak} />;
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cove-charcoal">
            Achievements
          </h2>
          <span className="text-xs text-cove-muted">
            {unlockedCount} / {totalCount} unlocked
          </span>
        </div>

        {/* Achievement progress bar */}
        <div className="w-full h-2 bg-cove-border/30 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-cove-amber rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(showAllAchievements ? data.achievements : data.achievements.slice(0, 6)).map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                a.unlocked
                  ? "bg-cove-amber/5 border-cove-amber/20"
                  : "bg-cove-offwhite/50 border-cove-border/20 opacity-50"
              }`}
            >
              {/* Badge */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  a.unlocked
                    ? "bg-cove-amber/15 text-cove-amber"
                    : "bg-cove-border/20 text-cove-muted"
                }`}
              >
                {a.unlocked ? a.xpReward : "?"}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${a.unlocked ? "text-cove-charcoal" : "text-cove-muted"}`}>
                  {a.name}
                </p>
                <p className="text-[11px] text-cove-muted truncate">
                  {a.description}
                </p>
              </div>

              {a.unlocked && (
                <span className="text-[10px] font-semibold text-cove-amber shrink-0">
                  +{a.xpReward}
                </span>
              )}
            </div>
          ))}
        </div>

        {data.achievements.length > 6 && (
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="w-full mt-3 py-2 text-xs font-medium text-cove-accent hover:text-cove-accent-hover transition-colors"
          >
            {showAllAchievements ? "Show less" : `Show all ${totalCount} achievements`}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-cove-border bg-cove-card p-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-cove-muted mt-0.5">{label}</p>
    </div>
  );
}

function getStreakMessage(current: number, weekActivity: WeekDay[], todayIdx: number): string {
  const activeToday = weekActivity[todayIdx]?.hit;

  if (current === 0) {
    return "Show up today to start a new streak. Every day counts.";
  }
  if (activeToday) {
    if (current === 1) return "Nice start. Come back tomorrow to keep it going.";
    if (current < 7) return `${current} days in a row. You're building momentum.`;
    if (current < 30) return `${current} days strong. Keep showing up.`;
    return `${current} days and counting. Incredible consistency.`;
  }
  return "Show up today to keep your streak alive.";
}
