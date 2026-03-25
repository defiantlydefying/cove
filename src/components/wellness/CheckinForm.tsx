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
    onChange: (v: number) => void
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={value === level}
            aria-label={`${label} ${LABELS[level]}`}
            onClick={() => onChange(level)}
            className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
              value === level
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {LABELS[level]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} aria-label="Wellness check-in form">
      <h2 className="text-lg font-semibold mb-4">Daily Check-in</h2>
      {renderRow("Mood", mood, setMood)}
      {renderRow("Energy", energy, setEnergy)}
      {renderRow("Sleep", sleep, setSleep)}
      <div className="mb-4">
        <label
          htmlFor="wellness-notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Notes
        </label>
        <textarea
          id="wellness-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={3}
          placeholder="How are you feeling today?"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Save check-in
      </button>
    </form>
  );
}
