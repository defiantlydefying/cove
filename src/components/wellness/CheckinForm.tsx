"use client";

import { useState } from "react";

const LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

const LEVELS = [1, 2, 3, 4, 5] as const;

export interface WellnessCheckinData {
  mood?: number | null;
  energy?: number | null;
  sleep?: number | null;
  notes?: string | null;
}

interface CheckinFormProps {
  existingCheckin?: WellnessCheckinData | null;
  onSubmit: (data: WellnessCheckinData) => void;
}

function SadFace() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cove-muted"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="9" cy="10" r="0.5" fill="currentColor" />
      <circle cx="15" cy="10" r="0.5" fill="currentColor" />
      <path d="M8 16c1.5-2 6.5-2 8 0" transform="rotate(180 12 16)" />
    </svg>
  );
}

function HappyFace() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cove-muted"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="9" cy="10" r="0.5" fill="currentColor" />
      <circle cx="15" cy="10" r="0.5" fill="currentColor" />
      <path d="M8 14c1.5 2 6.5 2 8 0" />
    </svg>
  );
}

export default function CheckinForm({
  existingCheckin,
  onSubmit,
}: CheckinFormProps) {
  const [mood, setMood] = useState<number | null>(
    existingCheckin?.mood ?? null
  );
  const [energy, setEnergy] = useState<number | null>(
    existingCheckin?.energy ?? null
  );
  const [sleep, setSleep] = useState<number | null>(
    existingCheckin?.sleep ?? null
  );
  const [notes, setNotes] = useState<string>(
    existingCheckin?.notes ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mood,
      energy,
      sleep,
      notes: notes.trim() || null,
    });
  };

  const renderRow = (
    label: string,
    value: number | null,
    onChange: (v: number) => void,
    showFaces?: boolean
  ) => {
    const selectedIndex = value ? value - 1 : -1;
    const fillPercent = value ? (value / 5) * 100 : 0;

    return (
      <div className="rounded-2xl bg-cove-card border border-cove-border p-5 mb-4">
        <label className="block text-base font-semibold text-cove-charcoal mb-3">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {showFaces && <SadFace />}
          <div className="flex-1">
            {/* Progress bar track */}
            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-cove-offwhite overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${fillPercent}%`,
                    background: "linear-gradient(to right, var(--color-cove-accent-light), var(--color-cove-accent), var(--color-cove-blue))",
                  }}
                />
              </div>
              {/* Level buttons */}
              <div
                className="relative flex justify-between"
                role="radiogroup"
                aria-label={label}
              >
                {LEVELS.map((level) => {
                  const isSelected = value === level;
                  const isFilled = value !== null && level <= value;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${label} ${LABELS[level]}`}
                      onClick={() => onChange(level)}
                      className="flex flex-col items-center gap-1.5 group focus:outline-none"
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          text-xs font-semibold border-2
                          transition-all duration-200 ease-out
                          ${
                            isSelected
                              ? "scale-125 shadow-lg border-transparent text-white"
                              : isFilled
                              ? "scale-100 border-transparent text-white"
                              : "scale-100 border-cove-border bg-cove-offwhite text-cove-muted group-hover:border-cove-accent group-hover:scale-110"
                          }
                        `}
                        style={
                          isFilled
                            ? {
                                background: `linear-gradient(135deg, var(--color-cove-accent), var(--color-cove-blue))`,
                                opacity: isSelected ? 1 : 0.5 + (level / 5) * 0.5,
                              }
                            : undefined
                        }
                      >
                        {level}
                      </div>
                      <span
                        className={`text-[10px] font-medium transition-colors ${
                          isSelected
                            ? "text-cove-charcoal"
                            : "text-cove-muted"
                        }`}
                      >
                        {LABELS[level]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {showFaces && <HappyFace />}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Wellness check-in form">
      <h2 className="text-xl font-bold text-cove-charcoal mb-6">
        Daily Check-in
      </h2>
      {renderRow("Mood", mood, setMood, true)}
      {renderRow("Energy", energy, setEnergy)}
      {renderRow("Sleep", sleep, setSleep)}
      <div className="rounded-2xl bg-cove-card border border-cove-border p-5 mb-6">
        <label
          htmlFor="wellness-notes"
          className="block text-base font-semibold text-cove-charcoal mb-3"
        >
          Notes
        </label>
        <textarea
          id="wellness-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-cove-border rounded-xl p-4 text-sm text-cove-charcoal bg-cove-offwhite placeholder:text-cove-muted focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-all resize-none"
          rows={4}
          placeholder="How are you feeling today?"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-2xl text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        style={{
          background: "linear-gradient(to right, var(--color-cove-accent), var(--color-cove-blue))",
        }}
      >
        Save check-in
      </button>
    </form>
  );
}
