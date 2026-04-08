"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import CheckinForm, { WellnessCheckinData } from "./CheckinForm";
import WellnessHistory, { CheckinRecord, PatternsData } from "./WellnessHistory";

export default function WellnessTracker() {
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<WellnessCheckinData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setError(false);
    try {
      const [checkinsRes, patternsRes] = await Promise.all([
        fetch("/api/wellness?days=30"),
        fetch("/api/wellness/patterns"),
      ]);

      if (!checkinsRes.ok || !patternsRes.ok) throw new Error();

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
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: WellnessCheckinData) => {
    try {
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      toast("Check-in saved.", "success");
    } catch {
      toast("Couldn\u2019t save check-in. Try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[380px] shrink-0">
          <div className="h-64 rounded-xl bg-cove-card border border-cove-border animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-48 rounded-xl bg-cove-card border border-cove-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
        <p className="text-cove-muted">Couldn&apos;t load wellness data.</p>
        <button
          onClick={fetchData}
          className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-[380px] shrink-0">
        <CheckinForm existingCheckin={todayCheckin} onSubmit={handleSubmit} />
      </div>
      <div className="flex-1 min-w-0">
        <WellnessHistory checkins={checkins} patterns={patterns} />
      </div>
    </div>
  );
}
