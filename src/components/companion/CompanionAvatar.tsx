"use client";

import { getCompanion, type CompanionType } from "@/lib/companions";

interface CompanionAvatarProps {
  type: CompanionType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
};

export default function CompanionAvatar({ type, size = "md", className = "" }: CompanionAvatarProps) {
  const companion = getCompanion(type);

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center select-none overflow-hidden ${className}`}
      role="img"
      aria-label={`${companion.name} companion`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/companions/${type}.png`}
        alt={companion.name}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
