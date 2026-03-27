"use client";

import { useEffect, useState } from "react";
import StreakCard, { Streak } from "./StreakCard";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  xpReward: number;
  unlockedAt: string;
}

interface GamificationData {
  streaks: Streak[];
  totalXp: number;
  achievements: Achievement[];
}

export default function GamificationPanel() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        <div className="text-center">
          <div className="h-4 w-16 mx-auto rounded bg-cove-border-light animate-pulse mb-2" />
          <div className="h-10 w-24 mx-auto rounded bg-cove-border-light animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-cove-border bg-cove-card p-4 h-24 animate-pulse" />
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-cove-muted">Total XP</p>
        <p className="text-4xl font-bold text-cove-amber">
          {data.totalXp.toLocaleString()}
        </p>
        <p className="text-xs text-cove-muted mt-1">
          Experience points earned from completing tasks, routines, and check-ins
        </p>
      </div>

      {data.streaks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.streaks.map((streak) => (
            <StreakCard key={streak.id} streak={streak} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 px-4 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-sm font-medium text-cove-charcoal mb-2">Build your momentum</p>
          <p className="text-xs text-cove-muted leading-relaxed max-w-sm mx-auto">
            Streaks grow when you show up consistently — completing tasks, following routines, or checking in on your wellness. Even one day in a row is a start.
          </p>
        </div>
      )}

      {data.achievements.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-cove-charcoal">
            Achievements
          </h2>
          <ul className="space-y-2">
            {data.achievements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-cove-border bg-cove-card p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-cove-charcoal break-words min-w-0">
                    {a.name}
                  </span>
                  <span className="text-sm text-cove-amber font-medium shrink-0">
                    +{a.xpReward} XP
                  </span>
                </div>
                <p className="text-sm text-cove-muted break-words">
                  {a.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
