"use client";

import CompanionAvatar from "./CompanionAvatar";
import type { CompanionType } from "@/lib/companions";

interface CompanionMessageProps {
  content: string;
  sender: "companion" | "user";
  companionType: CompanionType;
  source?: "text" | "voice";
  timestamp?: Date;
}

export default function CompanionMessage({
  content,
  sender,
  companionType,
  source,
  timestamp,
}: CompanionMessageProps) {
  const isCompanion = sender === "companion";

  return (
    <div className={`flex gap-2.5 ${isCompanion ? "items-start" : "items-start flex-row-reverse"}`}>
      {isCompanion && <CompanionAvatar type={companionType} size="sm" />}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isCompanion
            ? "bg-cove-card text-cove-charcoal rounded-tl-md"
            : "bg-cove-accent/15 text-cove-charcoal rounded-tr-md"
        }`}
      >
        {source === "voice" && (
          <span className="text-xs text-cove-muted mr-1.5" aria-label="Voice message">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline -mt-0.5"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            </svg>
          </span>
        )}
        {content}
        {timestamp && (
          <span className="block text-[10px] text-cove-muted/50 mt-1">
            {timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
