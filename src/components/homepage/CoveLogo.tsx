"use client";

interface CoveLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function CoveLogo({ size = 56, className = "", animate = false }: CoveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cove logo"
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6B8F80" />
          <stop offset="100%" stopColor="#7EAAA0" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="14" fill="url(#logoBg)" />
      <path
        d="M12 42 L24 22 L30 30 L38 16 L48 42 Z"
        fill="rgba(255,255,255,0.22)"
      />
      <path
        d="M22 42 Q30 32 38 42"
        fill="rgba(255,255,255,0.12)"
      />
      {animate && (
        <>
          <path
            d="M12 42 L24 22 L30 30 L38 16 L48 42"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-logo-stroke"
          />
          <path
            d="M22 42 Q30 32 38 42"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            className="animate-logo-stroke-delayed"
          />
        </>
      )}
    </svg>
  );
}
