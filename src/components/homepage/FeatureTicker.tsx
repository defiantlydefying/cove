"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

const MODULES = [
  { name: "Tasks", icon: "✓", color: "#6B8F71", bg: "rgba(107,143,113,0.06)", border: "rgba(107,143,113,0.12)" },
  { name: "Routines", icon: "↻", color: "#7EAAA0", bg: "rgba(126,170,160,0.06)", border: "rgba(126,170,160,0.12)" },
  { name: "Wellness", icon: "♡", color: "#A08BA0", bg: "rgba(160,139,160,0.06)", border: "rgba(160,139,160,0.12)" },
  { name: "Streaks", icon: "★", color: "#C4A055", bg: "rgba(196,160,85,0.06)", border: "rgba(196,160,85,0.12)" },
  { name: "Reminders", icon: "⏰", color: "#C4795B", bg: "rgba(196,121,91,0.06)", border: "rgba(196,121,91,0.12)" },
];

const ITEMS = [...MODULES, ...MODULES];

export default function FeatureTicker() {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full py-8 overflow-hidden bg-cove-offwhite" aria-label="Feature modules">
      <div
        className="flex gap-4 px-4"
        style={{
          animation: reduced ? "none" : "tickerScroll 20s linear infinite",
          width: "max-content",
        }}
      >
        {ITEMS.map((mod, i) => (
          <div
            key={`${mod.name}-${i}`}
            className="flex-shrink-0 w-[100px] h-[120px] rounded-xl flex flex-col items-center justify-center gap-2 text-xs font-medium backdrop-blur-md"
            style={{ background: mod.bg, border: `1px solid ${mod.border}`, color: mod.color }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: mod.bg.replace("0.06", "0.12") }}
            >
              {mod.icon}
            </div>
            {mod.name}
          </div>
        ))}
      </div>
    </section>
  );
}
