"use client";

import { useState, useEffect, useRef } from "react";

interface EventData {
  id?: string;
  title: string;
  date?: string;
  startTime: string;
  endTime: string;
  zone: string;
}

interface EventEditorProps {
  initial: EventData;
  position: { top: number; left: number };
  weekDays?: { date: string; label: string }[];
  onSave: (data: EventData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  onChange?: (data: { title: string; date: string; startTime: string; endTime: string; zone: string }) => void;
  isEditing: boolean;
}

const ZONES = [
  { key: "must", label: "Must Do", color: "#C4795B" },
  { key: "should", label: "Should Do", color: "#C4A055" },
  { key: "could", label: "Could Do", color: "#7EAAA0" },
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

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function EventEditor({
  initial,
  position,
  weekDays,
  onSave,
  onDelete,
  onCancel,
  onChange,
  isEditing,
}: EventEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date || "");
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [zone, setZone] = useState(initial.zone);

  // Notify parent of changes for live preview
  useEffect(() => {
    onChange?.({ title, date, startTime, endTime, zone });
  }, [title, date, startTime, endTime, zone]);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

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
    onSave({ id: initial.id, title: title.trim(), date, startTime, endTime, zone });
  };

  const duration = timeDiffMin(startTime, endTime);
  const currentZone = ZONES.find((z) => z.key === zone) || ZONES[0];

  // Clamp position to viewport
  const clampedTop = Math.max(8, Math.min(position.top, typeof window !== "undefined" ? window.innerHeight - 420 : position.top));
  const clampedLeft = Math.max(8, Math.min(position.left, typeof window !== "undefined" ? window.innerWidth - 440 : position.left));

  return (
    <div
      ref={ref}
      className="absolute z-50 w-[420px] bg-white rounded-lg shadow-[0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12),0_11px_15px_-7px_rgba(0,0,0,0.2)] overflow-hidden"
      style={{ top: `${clampedTop}px`, left: `${clampedLeft}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top bar — drag handle + close */}
      <div className="flex items-center justify-between px-2 pt-2 pb-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-full text-[#5f6368]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Title input */}
      <div className="px-6 pb-4">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Add title"
          maxLength={100}
          className="w-full text-[22px] font-normal bg-transparent outline-none text-[#3c4043] placeholder:text-[#80868b] border-b-2 border-[#e0e0e0] pb-2 focus:border-cove-accent transition-colors"
        />
      </div>

      {/* Priority tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-1">
          {ZONES.map((z) => (
            <button
              key={z.key}
              onClick={() => setZone(z.key)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                zone === z.key
                  ? "text-white"
                  : "text-[#5f6368] hover:bg-[#f1f3f4]"
              }`}
              style={zone === z.key ? { backgroundColor: z.color } : undefined}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Details list */}
      <div className="px-3 pb-4 space-y-0">
        {/* Date + time row */}
        <button
          onClick={() => { setShowTimePicker(!showTimePicker); setShowDayPicker(false); }}
          className="w-full flex items-center gap-4 py-3 hover:bg-[#f1f3f4] px-3 rounded-md transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <div className="text-left">
            <p className="text-[14px] text-[#3c4043]">
              {date ? formatDateLabel(date) : "Select day"}
              {"    "}
              {formatTime(startTime)}  –  {formatTime(endTime)}
            </p>
            {duration > 0 && (
              <p className="text-xs text-[#70757a] mt-0.5">
                Duration &middot; {duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}m` : ""}` : `${duration}m`}
              </p>
            )}
          </div>
        </button>

        {/* Expanded time picker */}
        {showTimePicker && (
          <div className="pl-10 pb-2 space-y-3">
            {/* Day selector */}
            {weekDays && weekDays.length > 0 && (
              <div className="flex gap-1">
                {weekDays.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setDate(d.date)}
                    className={`flex-1 py-2 text-[11px] font-medium rounded-md transition-all ${
                      date === d.date
                        ? "bg-cove-accent text-white"
                        : "text-[#70757a] hover:bg-[#f1f3f4]"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}

            {/* Time selectors */}
            <div className="flex items-center gap-3">
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  const newStart = e.target.value;
                  if (timeDiffMin(newStart, endTime) <= 0) {
                    const [h, m] = newStart.split(":").map(Number);
                    const endMin = h * 60 + m + 60;
                    setEndTime(`${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`);
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-white border border-[#DADCE0] rounded-md text-[#3c4043] focus:outline-none focus:border-cove-accent cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
              <span className="text-[#80868b] text-sm">–</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-white border border-[#DADCE0] rounded-md text-[#3c4043] focus:outline-none focus:border-cove-accent cursor-pointer"
              >
                {TIME_OPTIONS.filter((t) => timeDiffMin(startTime, t) > 0).map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Priority indicator row */}
        <div className="flex items-center gap-4 py-3 px-3">
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentZone.color }} />
          </div>
          <p className="text-[14px] text-[#3c4043]">{currentZone.label} priority</p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#f8f9fa]">
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="mr-auto text-sm text-[#C4795B]/70 hover:text-[#C4795B] transition-colors px-3 py-2"
          >
            Delete
          </button>
        )}
        <button
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-cove-accent hover:bg-cove-accent/5 rounded-full transition-colors"
        >
          More options
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-6 py-2 text-sm font-medium text-white bg-cove-accent rounded-full hover:bg-cove-accent-hover transition-colors disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}
