"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

interface WaveDividerProps {
  topColor?: string;
  bottomColor?: string;
}

export default function WaveDivider({
  topColor = "rgba(126,170,160,0.12)",
  bottomColor = "rgba(107,143,113,0.08)",
}: WaveDividerProps) {
  const reduced = useReducedMotion();

  return (
    <div className="relative w-full h-[60px] overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
          fill={topColor}
          style={{
            animation: reduced ? "none" : "waveShift1 6s ease-in-out infinite alternate",
          }}
        />
        <path
          d="M0,35 C200,10 400,55 600,30 C800,5 1000,50 1200,25 L1200,60 L0,60 Z"
          fill={bottomColor}
          style={{
            animation: reduced ? "none" : "waveShift2 8s ease-in-out -2s infinite alternate",
          }}
        />
      </svg>
    </div>
  );
}
