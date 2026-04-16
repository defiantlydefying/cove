"use client";

import { COMPANIONS, type CompanionType } from "@/lib/companions";
import CompanionAvatar from "./CompanionAvatar";

interface CompanionPickerProps {
  selected: CompanionType;
  onSelect: (type: CompanionType) => void;
}

export default function CompanionPicker({ selected, onSelect }: CompanionPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {COMPANIONS.map((companion) => {
        const isSelected = companion.type === selected;
        return (
          <button
            key={companion.type}
            onClick={() => onSelect(companion.type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-cove-accent bg-cove-accent/5"
                : "border-transparent bg-cove-card hover:border-cove-accent/30"
            }`}
          >
            <CompanionAvatar type={companion.type} size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold text-cove-charcoal">{companion.name}</p>
              <p className="text-xs text-cove-muted">{companion.personality}</p>
            </div>
            <p className="text-xs text-cove-muted/70 italic text-center leading-snug">
              &ldquo;{companion.sampleQuote}&rdquo;
            </p>
          </button>
        );
      })}
    </div>
  );
}
