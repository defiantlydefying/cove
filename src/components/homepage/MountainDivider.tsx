"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface MountainDividerProps {
  color?: string;
  flip?: boolean;
}

export default function MountainDivider({ color = "rgba(107,143,113,0.08)", flip = false }: MountainDividerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="w-full overflow-hidden"
      style={{ height: 80, transform: flip ? "scaleY(-1)" : undefined }}
      initial={reduced ? undefined : { clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0,80 L100,45 L200,65 L350,20 L450,55 L550,10 L700,50 L800,25 L900,55 L1050,15 L1100,40 L1200,80 Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}
