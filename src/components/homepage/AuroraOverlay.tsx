"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

export default function AuroraOverlay() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <div
        className="absolute w-[200%] h-[40%] top-[10%]"
        style={{
          filter: "blur(50px)",
          opacity: 0.12,
          background: "linear-gradient(90deg, transparent 0%, #6B8F71 15%, #7EAAA0 30%, transparent 45%, #A08BA0 60%, #C4A055 75%, transparent 100%)",
          animation: "auroraDrift 20s linear infinite",
        }}
      />
      <div
        className="absolute w-[200%] h-[40%] top-[35%]"
        style={{
          filter: "blur(50px)",
          opacity: 0.08,
          background: "linear-gradient(90deg, transparent 0%, #7EAAA0 20%, #C4A055 40%, transparent 55%, #6B8F71 70%, #C4795B 85%, transparent 100%)",
          animation: "auroraDrift 25s linear -8s infinite",
        }}
      />
      <div
        className="absolute w-[200%] h-[40%] top-[55%]"
        style={{
          filter: "blur(50px)",
          opacity: 0.1,
          background: "linear-gradient(90deg, transparent 0%, #A08BA0 10%, #6B8F71 30%, transparent 50%, #C4795B 65%, #7EAAA0 80%, transparent 100%)",
          animation: "auroraDrift 18s linear -4s infinite",
        }}
      />
    </div>
  );
}
