"use client";

import { COMPANIONS, type CompanionType } from "@/lib/companions";
import CompanionAvatar from "./CompanionAvatar";

interface CompanionPickerProps {
  selected: CompanionType;
  onSelect: (type: CompanionType) => void;
  variant?: "default" | "onboarding";
}

export default function CompanionPicker({
  selected,
  onSelect,
  variant = "default",
}: CompanionPickerProps) {
  const onboarding = variant === "onboarding";

  return (
    <div className={onboarding ? "onboarding-companion-grid" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}>
      {COMPANIONS.map((companion) => {
        const isSelected = companion.type === selected;
        return (
          <button
            type="button"
            key={companion.type}
            onClick={() => onSelect(companion.type)}
            aria-pressed={isSelected}
            className={`${onboarding ? "onboarding-companion-card" : "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left"} ${
              isSelected
                ? onboarding
                  ? "is-selected"
                  : "border-cove-accent bg-cove-accent/5"
                : onboarding
                  ? ""
                  : "border-transparent bg-cove-card hover:border-cove-accent/30"
            }`}
          >
            {onboarding && isSelected && (
              <span className="onboarding-card-check" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24">
                  <path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            <CompanionAvatar type={companion.type} size={onboarding ? "md" : "lg"} />
            <div className="text-center">
              <p className="text-sm font-semibold text-cove-charcoal">{companion.name}</p>
              <p className="text-xs text-cove-muted">{companion.personality}</p>
            </div>
            {!onboarding && (
              <p className="text-xs text-cove-muted/70 italic text-center leading-snug">
                &ldquo;{companion.sampleQuote}&rdquo;
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
