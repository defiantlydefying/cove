"use client";

import { useState } from "react";
import CompanionAvatar from "./CompanionAvatar";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface Suggestion {
  itemId: string;
  category: string;
  reason: string;
  suggestedTitle: string | null;
}

interface InboxSorterProps {
  companionType: CompanionType;
  onSortComplete: () => void;
}

export default function InboxSorter({ companionType, onSortComplete }: InboxSorterProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox/sort", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion: Suggestion) => {
    const { itemId, category, suggestedTitle } = suggestion;

    if (category === "task" && suggestedTitle) {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestedTitle }),
      });
      if (res.ok) {
        const task = await res.json();
        await fetch(`/api/inbox/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "converted",
            convertedTo: "task",
            convertedId: task.id,
          }),
        });
      }
    } else if (category === "reminder" && suggestedTitle) {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestedTitle, type: "custom" }),
      });
      if (res.ok) {
        const reminder = await res.json();
        await fetch(`/api/inbox/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "converted",
            convertedTo: "reminder",
            convertedId: reminder.id,
          }),
        });
      }
    } else {
      await fetch(`/api/inbox/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "converted", convertedTo: category }),
      });
    }

    setApplied((prev) => new Set(prev).add(itemId));
  };

  const allApplied =
    suggestions.length > 0 && suggestions.every((s) => applied.has(s.itemId));

  if (suggestions.length === 0) {
    return (
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cove-accent/10 text-cove-accent text-sm hover:bg-cove-accent/20 transition-colors disabled:opacity-50"
      >
        {loading ? <span className="animate-pulse">Thinking...</span> : <span>Help me sort</span>}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CompanionAvatar type={companionType} size="sm" />
        <p className="text-sm text-cove-charcoal">
          {allApplied
            ? getCompanionCopy(companionType, "sort_complete")
            : getCompanionCopy(companionType, "sort_offer")}
        </p>
      </div>
      {suggestions.map((s) => {
        const isApplied = applied.has(s.itemId);
        return (
          <div
            key={s.itemId}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isApplied
                ? "border-cove-accent/20 bg-cove-accent/5 opacity-60"
                : "border-cove-accent/10 bg-cove-card"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cove-charcoal">
                {s.suggestedTitle ?? "(note)"}
              </p>
              <p className="text-xs text-cove-muted">{s.reason}</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-cove-accent/10 text-cove-accent shrink-0">
              {s.category}
            </span>
            {!isApplied && (
              <button
                onClick={() => applySuggestion(s)}
                className="text-xs px-3 py-1.5 rounded-lg bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors shrink-0"
              >
                Apply
              </button>
            )}
            {isApplied && <span className="text-xs text-cove-accent shrink-0">Done</span>}
          </div>
        );
      })}
      {allApplied && (
        <button onClick={onSortComplete} className="text-sm text-cove-accent hover:underline">
          Back to chat
        </button>
      )}
    </div>
  );
}
