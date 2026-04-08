"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

const MOTE_COLORS = [
  "rgba(107,143,113,0.3)",
  "rgba(126,170,160,0.25)",
  "rgba(196,160,85,0.2)",
  "rgba(160,139,160,0.25)",
  "rgba(196,121,91,0.2)",
  "rgba(143,168,154,0.3)",
];

// Deterministic values to avoid hydration mismatch (no Math.random at module level)
const motes = [
  { id: 0, size: 3.2, left: 12, duration: 8.5, delay: 0.5 },
  { id: 1, size: 2.5, left: 28, duration: 9.2, delay: 2.1 },
  { id: 2, size: 3.8, left: 42, duration: 7.8, delay: 4.3 },
  { id: 3, size: 2.2, left: 55, duration: 10.1, delay: 1.2 },
  { id: 4, size: 3.5, left: 68, duration: 8.0, delay: 3.7 },
  { id: 5, size: 2.8, left: 82, duration: 9.5, delay: 5.8 },
  { id: 6, size: 3.0, left: 18, duration: 7.3, delay: 6.4 },
  { id: 7, size: 2.4, left: 35, duration: 10.5, delay: 0.8 },
  { id: 8, size: 3.6, left: 50, duration: 8.8, delay: 3.0 },
  { id: 9, size: 2.6, left: 65, duration: 9.0, delay: 7.2 },
  { id: 10, size: 3.3, left: 78, duration: 7.6, delay: 2.5 },
  { id: 11, size: 2.9, left: 90, duration: 8.3, delay: 4.9 },
].map((m) => ({ ...m, color: MOTE_COLORS[m.id % MOTE_COLORS.length] }));

export default function ParticleMotes() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[6] overflow-hidden" aria-hidden="true">
      {motes.map((m) => (
        <div
          key={m.id}
          className="absolute rounded-full"
          style={{
            width: `${m.size}px`,
            height: `${m.size}px`,
            left: `${m.left}%`,
            bottom: 0,
            background: m.color,
            animation: `moteFloat ${m.duration}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
