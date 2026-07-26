"use client";

import { useState, useRef, useEffect } from "react";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function nextMondayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// A far-future date used as a "Someday" tag — keeps the task in place (it never
// reads as overdue or shows up in date views) while letting us render "Someday".
export const SOMEDAY_DATE = "2999-12-31";

interface DeferData {
  scheduledDate: string | null;
}

const DEFER_OPTIONS = [
  { label: "Tomorrow", getValue: (): DeferData => ({ scheduledDate: tomorrowStr() }) },
  { label: "Next week", getValue: (): DeferData => ({ scheduledDate: nextMondayStr() }) },
  { label: "Someday", getValue: (): DeferData => ({ scheduledDate: SOMEDAY_DATE }) },
];

const WONT_DO_REASONS = ["Not relevant", "Too big", "Scope changed"];

export function DeferPopover({ onDefer, onClose }: { onDefer: (data: DeferData) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 w-48 bg-cove-card border border-cove-border rounded-xl shadow-lg overflow-hidden">
      {DEFER_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => { onDefer(opt.getValue()); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-charcoal hover:bg-cove-offwhite transition-colors"
        >
          {opt.label}
        </button>
      ))}
      <div className="border-t border-cove-border/30">
        {showPicker ? (
          <div className="p-2">
            <input
              type="date"
              min={todayStr()}
              onChange={(e) => {
                if (e.target.value) {
                  onDefer({ scheduledDate: e.target.value });
                  onClose();
                }
              }}
              autoFocus
              className="w-full px-2 py-1.5 text-xs border border-cove-border rounded-lg bg-cove-offwhite text-cove-charcoal focus:outline-none focus:border-cove-accent"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full px-3 py-2 text-xs text-left text-cove-muted hover:bg-cove-offwhite transition-colors"
          >
            Pick a date...
          </button>
        )}
      </div>
      <div className="border-t border-cove-border/30">
        <button
          onClick={() => { onDefer({ scheduledDate: null }); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-muted hover:bg-cove-offwhite transition-colors"
        >
          Clear date
        </button>
      </div>
    </div>
  );
}

export function WontDoPopover({ onWontDo, onClose }: { onWontDo: (reason?: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 w-56 bg-cove-card border border-cove-border rounded-xl shadow-lg overflow-hidden">
      <div className="px-3 pt-2 pb-1">
        <p className="text-[10px] text-cove-muted">Why? (optional)</p>
      </div>
      {WONT_DO_REASONS.map((reason) => (
        <button
          key={reason}
          onClick={() => { onWontDo(reason); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-charcoal hover:bg-cove-offwhite transition-colors"
        >
          {reason}
        </button>
      ))}
      <div className="border-t border-cove-border/30 p-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) { onWontDo(custom.trim()); onClose(); }
          }}
          placeholder="Other reason..."
          className="w-full px-2 py-1.5 text-xs border border-cove-border rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:border-cove-accent"
        />
      </div>
      <div className="border-t border-cove-border/30">
        <button
          onClick={() => { onWontDo(); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-muted hover:bg-cove-offwhite transition-colors"
        >
          Skip — just archive it
        </button>
      </div>
    </div>
  );
}
