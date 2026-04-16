"use client";

import { getCompanion, type CompanionType } from "@/lib/companions";

interface CompanionAvatarProps {
  type: CompanionType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-20 h-20 text-4xl",
};

export default function CompanionAvatar({ type, size = "md", className = "" }: CompanionAvatarProps) {
  const companion = getCompanion(type);

  return (
    <div
      className={`${sizes[size]} rounded-full bg-cove-accent/10 flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label={`${companion.name} companion`}
    >
      {companion.emoji}
    </div>
  );
}
