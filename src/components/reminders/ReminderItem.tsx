"use client";

import { useState } from "react";
import { formatScheduleSummary } from "@/lib/reminder-presets";
import ReminderScheduleFields from "./ReminderScheduleFields";

export interface Reminder {
  id: string;
  title: string;
  message?: string | null;
  type: string;
  schedule?: string | null;
  enabled: boolean;
  snoozedUntil?: string | null;
  scheduledTime?: string | null;
  intervalMinutes?: number | null;
  activeDays?: string;
  presetKey?: string | null;
  soundEnabled?: boolean;
  notifyEnabled?: boolean;
}

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
  onUpdate: (id: string, fields: Partial<Reminder>) => void;
}

const badgeColors: Record<string, string> = {
  hydration: "bg-cove-blue-light text-cove-blue",
  break: "bg-cove-accent-light text-cove-accent",
  medication: "bg-cove-heather-light text-cove-heather",
  "self-care": "bg-cove-amber-light text-cove-amber",
  custom: "bg-cove-sand-light text-cove-muted",
};

export default function ReminderItem({
  reminder,
  onToggle,
  onDelete,
  onSnooze,
  onUpdate,
}: ReminderItemProps) {
  const [expanded, setExpanded] = useState(false);

  const isSnoozed =
    reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date();

  const scheduleSummary = formatScheduleSummary(
    reminder.scheduledTime,
    reminder.intervalMinutes,
    reminder.activeDays
  );

  return (
    <div
      className={`rounded-xl border transition-colors ${
        expanded
          ? "border-cove-accent/30 bg-cove-card shadow-sm"
          : "border-cove-border-light bg-cove-card"
      }`}
      data-testid="reminder-item"
    >
      <div className="flex items-start gap-3 p-3 group">
        <button
          role="switch"
          aria-checked={reminder.enabled}
          aria-label={`Toggle ${reminder.title}`}
          onClick={() => onToggle(reminder.id, !reminder.enabled)}
          className={`mt-0.5 shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            reminder.enabled ? "bg-cove-accent" : "bg-cove-border"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              reminder.enabled ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>

        <div className="flex-1 min-w-0">
          <span
            className={`break-words text-sm ${
              reminder.enabled ? "text-cove-charcoal" : "text-cove-muted"
            }`}
          >
            {reminder.title}
          </span>

          {reminder.scheduledTime && (
            <p className="text-xs text-cove-muted mt-0.5">{scheduleSummary}</p>
          )}

          {reminder.message && (
            <p className="text-xs text-cove-muted mt-0.5 break-words">{reminder.message}</p>
          )}

          <div className="flex flex-wrap gap-1 mt-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                badgeColors[reminder.type] ?? badgeColors.custom
              }`}
              data-testid="type-badge"
            >
              {reminder.type}
            </span>

            {isSnoozed && (
              <span className="text-xs text-cove-muted">
                Snoozed until{" "}
                {new Date(reminder.snoozedUntil!).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Close settings" : "Open settings"}
          className={`shrink-0 mt-0.5 p-1 rounded-md transition-colors ${
            expanded
              ? "text-cove-accent"
              : "text-cove-muted hover:text-cove-charcoal"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button
          onClick={() => onSnooze(reminder.id)}
          aria-label={`Snooze ${reminder.title}`}
          className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-cove-charcoal shrink-0 mt-0.5 text-xs transition-opacity"
        >
          Snooze
        </button>

        <button
          onClick={() => onDelete(reminder.id)}
          aria-label={`Delete ${reminder.title}`}
          className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-cove-charcoal shrink-0 mt-0.5 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-cove-border-light px-3 py-3 animate-fade-in-up">
          <ReminderScheduleFields
            compact
            scheduledTime={reminder.scheduledTime ?? "09:00"}
            intervalMinutes={reminder.intervalMinutes ?? null}
            activeDays={reminder.activeDays ?? "0,1,2,3,4,5,6"}
            soundEnabled={reminder.soundEnabled ?? true}
            notifyEnabled={reminder.notifyEnabled ?? true}
            onTimeChange={(v) => onUpdate(reminder.id, { scheduledTime: v })}
            onIntervalChange={(v) => onUpdate(reminder.id, { intervalMinutes: v })}
            onDaysChange={(v) => onUpdate(reminder.id, { activeDays: v })}
            onSoundChange={(v) => onUpdate(reminder.id, { soundEnabled: v })}
            onNotifyChange={(v) => onUpdate(reminder.id, { notifyEnabled: v })}
          />
        </div>
      )}
    </div>
  );
}
