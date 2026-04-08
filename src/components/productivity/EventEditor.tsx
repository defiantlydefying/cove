"use client";

import { useState, useEffect, useRef } from "react";

interface EventData {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  zone: string;
}

interface EventEditorProps {
  initial: EventData;
  position: { top: number; left: number };
  onSave: (data: EventData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ZONES = [
  { key: "must", label: "Must Do" },
  { key: "should", label: "Should Do" },
  { key: "could", label: "Could Do" },
];

function generateTimeOptions() {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function timeDiffMin(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function EventEditor({
  initial,
  position,
  onSave,
  onDelete,
  onCancel,
  isEditing,
}: EventEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [zone, setZone] = useState(initial.zone);
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCancel]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ id: initial.id, title: title.trim(), startTime, endTime, zone });
  };

  const duration = timeDiffMin(startTime, endTime);

  return (
    <div
      ref={ref}
      className="absolute z-50 w-72 bg-cove-card border border-cove-border rounded-xl shadow-lg overflow-hidden"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Event title"
          maxLength={100}
          className="w-full text-sm font-medium bg-transparent border-none outline-none text-cove-charcoal placeholder:text-cove-muted"
        />
      </div>

      <div className="px-4 pb-3 flex flex-col gap-3">
        {/* Time selectors */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-cove-muted block mb-0.5">Start</label>
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                // Auto-adjust end time if it's before start
                const newStart = e.target.value;
                if (timeDiffMin(newStart, endTime) <= 0) {
                  const [h, m] = newStart.split(":").map(Number);
                  const endMin = h * 60 + m + 60;
                  setEndTime(`${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`);
                }
              }}
              className="w-full px-2 py-1.5 text-xs bg-cove-offwhite border border-cove-border rounded-lg text-cove-charcoal focus:outline-none focus:border-cove-accent"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>

          <span className="text-cove-muted text-xs mt-3">to</span>

          <div className="flex-1">
            <label className="text-[10px] text-cove-muted block mb-0.5">End</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-cove-offwhite border border-cove-border rounded-lg text-cove-charcoal focus:outline-none focus:border-cove-accent"
            >
              {TIME_OPTIONS.filter((t) => timeDiffMin(startTime, t) > 0).map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration display */}
        {duration > 0 && (
          <p className="text-[10px] text-cove-muted -mt-1">
            {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60 ? `${duration % 60}m` : ""}` : `${duration}m`}
          </p>
        )}

        {/* Zone / priority */}
        <div>
          <label className="text-[10px] text-cove-muted block mb-1">Priority</label>
          <div className="flex gap-1">
            {ZONES.map((z) => (
              <button
                key={z.key}
                onClick={() => setZone(z.key)}
                className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                  zone === z.key
                    ? "bg-cove-accent/10 border-cove-accent/30 text-cove-accent"
                    : "border-cove-border/30 text-cove-muted hover:border-cove-border"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-cove-border/30">
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-cove-error/70 hover:text-cove-error transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-1.5 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors disabled:opacity-40"
          >
            {isEditing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
