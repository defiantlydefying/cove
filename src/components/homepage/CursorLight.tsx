"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px)`;
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-[7] rounded-full opacity-0 transition-opacity duration-300"
      style={{
        width: 120,
        height: 120,
        background: "radial-gradient(circle, rgba(107,143,113,0.15) 0%, transparent 70%)",
      }}
      aria-hidden="true"
    />
  );
}
