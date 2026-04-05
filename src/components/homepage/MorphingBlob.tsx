"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

interface MorphingBlobProps {
  className?: string;
  colors?: [string, string];
}

export default function MorphingBlob({
  className = "",
  colors = ["rgba(107,143,113,0.15)", "rgba(126,170,160,0.10)"],
}: MorphingBlobProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
          borderRadius: "42% 58% 62% 38% / 46% 52% 48% 54%",
          filter: "blur(1px)",
          animation: reduced ? "none" : "blobMorph 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}
