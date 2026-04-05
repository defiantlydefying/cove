"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface RollingDigitProps {
  digit: number;
  className?: string;
}

export default function RollingDigit({ digit, className = "" }: RollingDigitProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={`text-2xl font-semibold text-cove-amber tabular-nums ${className}`}>{digit}</span>;
  }

  return (
    <div className={`overflow-hidden h-10 ${className}`}>
      <motion.div
        initial={{ y: 0 }}
        whileInView={{ y: -digit * 40 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        className="flex flex-col"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-10 flex items-center justify-center text-2xl font-semibold text-cove-amber tabular-nums">
            {i}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
