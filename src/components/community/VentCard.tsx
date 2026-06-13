"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import AvatarDisplay from "./AvatarDisplay";

export interface VentData {
  id: string;
  body: string;
  lifespan: string;
  expiresAt: string;
  contactPreference: string;
  createdAt: string;
  displayName: string | null;
  avatarKey: string | null;
  commentCount: number;
  isOwn: boolean;
}

interface VentCardProps {
  vent: VentData;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  onProfileClick?: (displayName: string, avatarKey: string | null) => void;
}

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

export default function VentCard({ vent, onDelete, onExpand, onProfileClick }: VentCardProps) {
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const { toast } = useToast();

  async function handleReport() {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/community/vents/${vent.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t report. Try again.", "error");
        return;
      }
      toast("Report submitted. Thank you.", "success");
      setShowReportInput(false);
      setReportReason("");
    } catch {
      toast("Couldn\u2019t report. Try again.", "error");
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onProfileClick?.(vent.displayName ?? "anonymous", vent.avatarKey)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <AvatarDisplay avatarKey={vent.avatarKey} size="sm" />
          <span className="text-xs font-medium text-cove-charcoal">
            {vent.displayName ?? "anonymous"}
          </span>
        </button>
        <span className="text-xs text-cove-muted ml-auto">{timeRemaining(vent.expiresAt)}</span>
      </div>

      <p className="text-sm text-cove-charcoal leading-relaxed whitespace-pre-wrap">{vent.body}</p>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onExpand(vent.id)}
          className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {vent.commentCount > 0 ? vent.commentCount : "Comment"}
        </button>

        {!vent.isOwn && (
          <button
            onClick={() => setShowReportInput(!showReportInput)}
            className="text-xs text-cove-muted hover:text-cove-error transition-colors"
          >
            Report
          </button>
        )}

        {vent.isOwn && (
          <button
            onClick={() => onDelete(vent.id)}
            className="text-xs text-cove-muted hover:text-cove-error transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {showReportInput && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting this?"
            maxLength={200}
            className="flex-1 px-3 py-1.5 text-xs border border-cove-border-light rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-1 focus:ring-cove-accent/30"
          />
          <button
            onClick={handleReport}
            disabled={reporting || !reportReason.trim()}
            className="text-xs px-3 py-1.5 bg-cove-error text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
