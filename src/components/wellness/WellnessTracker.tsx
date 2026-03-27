"use client";

import { useEffect, useState, useCallback } from "react";
import CheckinForm, { WellnessCheckinData } from "./CheckinForm";
import WellnessHistory, { CheckinRecord, PatternsData } from "./WellnessHistory";

export default function WellnessTracker() {
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<WellnessCheckinData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [checkinsRes, patternsRes] = await Promise.all([
        fetch("/api/wellness?days=7"),
        fetch("/api/wellness/patterns"),
      ]);

      const checkinsData = await checkinsRes.json();
      const patternsData = await patternsRes.json();

      setCheckins(checkinsData);
      setPatterns(patternsData);

      // Find today's check-in
      const today = new Date().toISOString().slice(0, 10);
      const existing = (checkinsData as CheckinRecord[]).find((c) =>
        c.date.startsWith(today)
      );
      setTodayCheckin(existing ?? null);
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: WellnessCheckinData) => {
    await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchData();
  };

  if (loading) {
    return <p>Loading wellness data...</p>;
  }

  return (
    <div className="flex gap-6">
      <div className="w-[380px] shrink-0">
        <CheckinForm existingCheckin={todayCheckin} onSubmit={handleSubmit} />
      </div>
      <div className="flex-1 min-w-0">
        <WellnessHistory checkins={checkins} patterns={patterns} />
      </div>
    </div>
  );
}
