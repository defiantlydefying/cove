"use client";

import { REMINDER_PRESETS, type ReminderPreset } from "@/lib/reminder-presets";

interface ReminderPresetPickerProps {
  onSelect: (preset: ReminderPreset) => void;
}

// Each group shares a color. Groups are arranged in visual sections within the grid.
const PRESET_COLORS: Record<string, string> = {
  // Health essentials — heather
  medication: "border-cove-heather/30 bg-cove-heather-light",
  water:      "border-cove-heather/30 bg-cove-heather-light",
  eat:        "border-cove-heather/30 bg-cove-heather-light",
  // Body care — amber
  shower:     "border-cove-amber/30 bg-cove-amber-light",
  sunlight:   "border-cove-amber/30 bg-cove-amber-light",
  bedtime:    "border-cove-amber/30 bg-cove-amber-light",
  // Movement & calm — accent (sage green)
  stretch:    "border-cove-accent/30 bg-cove-accent-light",
  break:      "border-cove-accent/30 bg-cove-accent-light",
  breathe:    "border-cove-accent/30 bg-cove-accent-light",
  // Awareness & connection — blue (teal)
  checkin:    "border-cove-blue/30 bg-cove-blue-light",
  tidy:       "border-cove-blue/30 bg-cove-blue-light",
  connect:    "border-cove-blue/30 bg-cove-blue-light",
};

const DEFAULT_COLOR = "border-cove-border-light bg-cove-sand-light";

export default function ReminderPresetPicker({
  onSelect,
}: ReminderPresetPickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {REMINDER_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset)}
          className={`p-3 rounded-xl border text-left hover:shadow-md hover:scale-[1.02] transition-all ${
            PRESET_COLORS[preset.key] ?? DEFAULT_COLOR
          }`}
        >
          <p className="text-sm font-semibold text-cove-charcoal">
            {preset.title}
          </p>
          <p className="text-xs text-cove-muted mt-0.5">
            {preset.description}
          </p>
        </button>
      ))}
    </div>
  );
}
