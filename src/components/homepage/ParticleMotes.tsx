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

const motes = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 2 + Math.random() * 2,
  left: Math.random() * 100,
  duration: 7 + Math.random() * 4,
  delay: Math.random() * 8,
  color: MOTE_COLORS[i % MOTE_COLORS.length],
}));

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
            width: m.size,
            height: m.size,
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
