"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import CommunityRoutineCard, { type CommunityRoutine } from "./CommunityRoutineCard";

const CONDITION_TAGS = ["ADHD", "Autism", "Anxiety", "Depression", "OCD", "PTSD", "Bipolar", "Dyslexia", "General"];
const TYPE_TAGS = ["Morning", "Evening", "Work", "Self-Care", "Exercise", "Hygiene", "Social", "Wind-Down", "Focus"];

export default function CommunityBrowser() {
  const [routines, setRoutines] = useState<CommunityRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchRoutines = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      for (const tag of selectedTags) {
        params.append("tag", tag);
      }
      const res = await fetch(`/api/community/routines?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoutines(data.routines);
      setTotalPages(data.pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, selectedTags]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setPage(1);
  }

  async function handleHelpful(id: string) {
    // Optimistic update
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              userHelpful: !r.userHelpful,
              helpfulCount: r.userHelpful ? r.helpfulCount - 1 : r.helpfulCount + 1,
            }
          : r
      )
    );

    try {
      const res = await fetch(`/api/community/routines/${id}/helpful`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      await fetchRoutines();
      toast("Couldn\u2019t update. Try again.", "error");
    }
  }

  async function handleImport(id: string) {
    try {
      const res = await fetch(`/api/community/routines/${id}/import`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast("Routine added to your list.", "success");
    } catch {
      toast("Couldn\u2019t import routine. Try again.", "error");
    }
  }

  async function handleReport(id: string, reason: string) {
    try {
      const res = await fetch(`/api/community/routines/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast("Report submitted. Thank you.", "success");
    } catch {
      toast("Couldn\u2019t submit report. Try again.", "error");
    }
  }

  async function handleUnpublish(id: string) {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/community/routines/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Routine unpublished.", "success");
    } catch {
      await fetchRoutines();
      toast("Couldn\u2019t unpublish. Try again.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Community Routines</h2>
        <p className="text-xs text-cove-muted mt-1">
          Routines shared by people like you. Everything here is optional.
        </p>
      </div>

      {/* Tag filters */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium text-cove-muted mb-1.5">Filter by condition</p>
          <div className="flex flex-wrap gap-1.5">
            {CONDITION_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-cove-muted mb-1.5">Filter by type</p>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        {selectedTags.size > 0 && (
          <button
            onClick={() => { setSelectedTags(new Set()); setPage(1); }}
            className="text-xs text-cove-accent hover:text-cove-accent-hover self-start"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-cove-border-light animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
          <p className="text-cove-muted">Couldn&apos;t load community routines.</p>
          <button
            onClick={fetchRoutines}
            className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && routines.length === 0 && (
        <div className="text-center py-8 px-6 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-base font-medium text-cove-charcoal mb-2">
            {selectedTags.size > 0 ? "No routines match those filters" : "No shared routines yet"}
          </p>
          <p className="text-sm text-cove-muted leading-relaxed max-w-md mx-auto">
            {selectedTags.size > 0
              ? "Try different filters or clear them to see all routines."
              : "Be the first to share a routine that works for you. Go to the Routines tab and click the share button on any routine."}
          </p>
        </div>
      )}

      {!loading && !error && routines.length > 0 && (
        <div className="flex flex-col gap-3">
          {routines.map((routine) => (
            <CommunityRoutineCard
              key={routine.id}
              routine={routine}
              onHelpful={handleHelpful}
              onImport={handleImport}
              onReport={handleReport}
              onUnpublish={routine.isOwn ? handleUnpublish : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-cove-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
