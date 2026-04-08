"use client";

import { useState, memo } from "react";

interface CommunityStep {
  id: string;
  title: string;
  durationMinutes?: number | null;
}

export interface CommunityRoutine {
  id: string;
  displayName: string;
  authorNote?: string | null;
  name: string;
  description?: string | null;
  startTime?: string | null;
  showTimes?: boolean;
  showDurations?: boolean;
  tags: string[];
  helpfulCount: number;
  steps: CommunityStep[];
  userHelpful: boolean;
  isOwn: boolean;
}

interface CommunityRoutineCardProps {
  routine: CommunityRoutine;
  onHelpful: (id: string) => void;
  onImport: (id: string) => void;
  onReport: (id: string, reason: string) => void;
  onUnpublish?: (id: string) => void;
}

const TAG_COLORS: Record<string, string> = {
  // Conditions
  ADHD: "bg-cove-heather-light text-cove-heather",
  Autism: "bg-cove-blue-light text-cove-blue",
  Anxiety: "bg-cove-amber-light text-cove-amber",
  Depression: "bg-cove-sage-light text-cove-sage",
  OCD: "bg-cove-heather-light text-cove-heather",
  PTSD: "bg-cove-amber-light text-cove-amber",
  Bipolar: "bg-cove-blue-light text-cove-blue",
  Dyslexia: "bg-cove-sage-light text-cove-sage",
  General: "bg-cove-sand-light text-cove-muted",
  // Types
  Morning: "bg-cove-amber-light text-cove-amber",
  Evening: "bg-cove-heather-light text-cove-heather",
  Work: "bg-cove-blue-light text-cove-blue",
  "Self-Care": "bg-cove-accent-light text-cove-accent",
  Exercise: "bg-cove-accent-light text-cove-accent",
  Hygiene: "bg-cove-sage-light text-cove-sage",
  Social: "bg-cove-amber-light text-cove-amber",
  "Wind-Down": "bg-cove-heather-light text-cove-heather",
  Focus: "bg-cove-blue-light text-cove-blue",
};

const REPORT_REASONS = [
  "Inappropriate content",
  "Harmful advice",
  "Spam",
  "Other",
];

export default memo(function CommunityRoutineCard({
  routine,
  onHelpful,
  onImport,
  onReport,
  onUnpublish,
}: CommunityRoutineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const totalMinutes = routine.steps.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0
  );

  function handleReport() {
    if (!reportReason.trim()) return;
    onReport(routine.id, reportReason.trim());
    setShowReport(false);
    setReportReason("");
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-cove-charcoal break-words">
            {routine.name}
          </h3>
          <p className="text-xs text-cove-muted mt-0.5">
            Shared by {routine.displayName}
            {totalMinutes > 0 && ` · ${totalMinutes} min`}
            {` · ${routine.steps.length} steps`}
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="text-cove-muted hover:text-cove-charcoal shrink-0 mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Author note */}
      {routine.authorNote && (
        <p className="text-sm text-cove-charcoal/80 italic break-words">
          {routine.authorNote}
        </p>
      )}

      {/* Description */}
      {routine.description && (
        <p className="text-sm text-cove-muted break-words">
          {routine.description}
        </p>
      )}

      {/* Tags */}
      {routine.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {routine.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-0.5 rounded-lg ${
                TAG_COLORS[tag] ?? "bg-cove-sand-light text-cove-muted"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Expanded steps */}
      {expanded && (
        <div className="flex flex-col gap-1.5 border-t border-cove-border-light pt-3 animate-fade-in-up">
          {routine.steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-cove-muted w-5 text-right shrink-0">{i + 1}.</span>
              <span className="text-cove-charcoal flex-1">{step.title}</span>
              {step.durationMinutes && (
                <span className="text-xs text-cove-muted shrink-0">{step.durationMinutes}m</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onHelpful(routine.id)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            routine.userHelpful
              ? "bg-cove-accent-light text-cove-accent font-medium"
              : "bg-cove-offwhite text-cove-muted hover:text-cove-charcoal"
          }`}
        >
          Helpful{routine.helpfulCount > 0 ? ` (${routine.helpfulCount})` : ""}
        </button>

        {!routine.isOwn && (
          <button
            onClick={() => onImport(routine.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Add to my routines
          </button>
        )}

        {routine.isOwn && onUnpublish && (
          <button
            onClick={() => onUnpublish(routine.id)}
            className="text-xs px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-error transition-colors"
          >
            Unpublish
          </button>
        )}

        {!routine.isOwn && (
          <button
            onClick={() => setShowReport((v) => !v)}
            className="text-xs text-cove-muted hover:text-cove-charcoal ml-auto transition-colors"
          >
            Report
          </button>
        )}
      </div>

      {/* Report form */}
      {showReport && (
        <div className="flex flex-col gap-2 p-3 bg-cove-offwhite rounded-lg border border-cove-border-light animate-fade-in-up">
          <p className="text-xs font-medium text-cove-charcoal">Why are you reporting this?</p>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="text-sm px-3 py-2 border border-cove-border rounded-xl bg-cove-card text-cove-charcoal focus:outline-none focus:ring-2 focus:ring-cove-accent/30"
          >
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleReport}
              disabled={!reportReason}
              className="text-xs px-3 py-1.5 rounded-lg bg-cove-error text-white hover:bg-cove-error/90 disabled:opacity-50 transition-colors"
            >
              Submit report
            </button>
            <button
              onClick={() => { setShowReport(false); setReportReason(""); }}
              className="text-xs px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
