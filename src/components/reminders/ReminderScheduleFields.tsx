"use client";

import { INTERVAL_OPTIONS, DAY_LABELS } from "@/lib/reminder-presets";

interface ReminderScheduleFieldsProps {
  scheduledTime: string;
  intervalMinutes: number | null;
  activeDays: string;
  soundEnabled: boolean;
  notifyEnabled: boolean;
  onTimeChange: (time: string) => void;
  onIntervalChange: (interval: number | null) => void;
  onDaysChange: (days: string) => void;
  onSoundChange: (enabled: boolean) => void;
  onNotifyChange: (enabled: boolean) => void;
  compact?: boolean;
}

export default function ReminderScheduleFields({
  scheduledTime,
  intervalMinutes,
  activeDays,
  soundEnabled,
  notifyEnabled,
  onTimeChange,
  onIntervalChange,
  onDaysChange,
  onSoundChange,
  onNotifyChange,
  compact = false,
}: ReminderScheduleFieldsProps) {
  const dayIndices = activeDays.split(",").map(Number);

  function toggleDay(dayIndex: number) {
    const current = new Set(dayIndices);
    if (current.has(dayIndex)) {
      current.delete(dayIndex);
    } else {
      current.add(dayIndex);
    }
    if (current.size === 0) return;
    const sorted = Array.from(current).sort((a, b) => a - b);
    onDaysChange(sorted.join(","));
  }

  const labelClass = compact
    ? "text-xs text-cove-muted w-14 shrink-0"
    : "text-sm font-medium text-cove-charcoal mb-1 block";

  const inputClass =
    "px-3 py-2 text-sm border border-cove-border rounded-xl bg-cove-offwhite text-cove-charcoal focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-colors";

  return (
    <div className={`flex flex-col ${compact ? "gap-3" : "gap-4"}`}>
      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Time</label>
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className={inputClass}
          aria-label="Reminder time"
        />
      </div>

      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Repeat</label>
        <select
          value={intervalMinutes ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onIntervalChange(val === "" ? null : Number(val));
          }}
          className={inputClass}
          aria-label="Repeat interval"
        >
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Days</label>
        <div className="flex gap-1" role="group" aria-label="Active days">
          {DAY_LABELS.map((label, index) => {
            const active = dayIndices.includes(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                aria-pressed={active}
                aria-label={
                  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index]
                }
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border hover:border-cove-accent/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex ${compact ? "gap-4" : "gap-6"} items-center`}>
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onSoundChange(e.target.checked)}
            className="accent-cove-accent"
          />
          Sound
        </label>
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={notifyEnabled}
            onChange={(e) => onNotifyChange(e.target.checked)}
            className="accent-cove-accent"
          />
          Browser alerts
        </label>
      </div>
    </div>
  );
}
