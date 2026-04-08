"use client";

import { useEffect, useState } from "react";
import StreakCard, { Streak } from "./StreakCard";

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

interface GamificationData {
  streaks: Streak[];
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

  return (
    <div className="flex flex-col gap-6">
      {/* Level card */}
      <div className="rounded-xl border border-cove-accent/20 bg-cove-accent/5 p-5">
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

      {/* Streaks */}
      <div>
        <h2 className="text-sm font-semibold text-cove-charcoal mb-3">Streaks</h2>
        {data.streaks.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.streaks.map((streak) => (
              <StreakCard key={streak.id} streak={streak} />
            ))}
          </div>
        ) : (
          <div className="py-6 px-4 rounded-xl bg-cove-offwhite border border-cove-border-light text-center">
            <p className="text-sm font-medium text-cove-charcoal mb-1">Build your momentum</p>
            <p className="text-xs text-cove-muted leading-relaxed max-w-md mx-auto">
              Streaks grow when you show up consistently. Complete a task, log a focus session, or check in on your wellness to start your first streak.
            </p>
          </div>
        )}
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
