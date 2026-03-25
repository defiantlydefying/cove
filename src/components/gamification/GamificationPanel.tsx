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

  useEffect(() => {
    fetch("/api/gamification")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Failed to load gamification data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {data.totalXp}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.streaks.map((streak) => (
          <StreakCard key={streak.id} streak={streak} />
        ))}
      </div>

      {data.achievements.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Achievements
          </h2>
          <ul className="space-y-2">
            {data.achievements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {a.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    +{a.xpReward} XP
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
