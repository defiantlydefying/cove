"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function SplitReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  const splitAmount = useTransform(scrollYProgress, [0.2, 0.6], [0, 6]);
  const revealOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const seamGlow = useTransform(scrollYProgress, [0.2, 0.5], [0.3, 1]);

  return (
    <section ref={ref} className="relative w-full h-screen overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-end pr-12"
        style={{
          background: "linear-gradient(135deg, #E6F0ED, #EAF0EB)",
          clipPath: reduced ? undefined : useTransform(splitAmount, (v) => `inset(0 ${v}% 0 0)`),
          filter: "saturate(0.4)",
        }}
      >
        <div className="text-right">
          <h3 className="text-lg font-semibold text-cove-accent mb-2">Before Cove</h3>
          <p className="text-sm text-cove-muted">Scattered. Overwhelmed.</p>
          <div className="mt-4 flex flex-col gap-2 items-end opacity-50">
            {["📋", "⏰", "📝", "🔔"].map((e, i) => (
              <span key={i} className="text-lg" style={{ transform: `rotate(${(i - 2) * 8}deg) translate(${i * 3}px, ${(i - 1) * -4}px)` }}>{e}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-start pl-12"
        style={{
          background: "linear-gradient(135deg, #EAF0EB, #F5EFE0)",
          clipPath: reduced ? undefined : useTransform(splitAmount, (v) => `inset(0 0 0 ${v}%)`),
        }}
      >
        <div>
          <h3 className="text-lg font-semibold text-cove-blue mb-2">After Cove</h3>
          <p className="text-sm text-cove-muted">Calm. Organized. Yours.</p>
          <div className="mt-4 flex flex-col gap-2 opacity-80">
            {["✓ Morning routine", "✓ Focus time", "✓ Check in"].map((t, i) => (
              <span key={i} className="text-sm text-cove-accent">{t}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full z-10"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(107,143,113,0.3), rgba(196,160,85,0.3), transparent)",
          opacity: seamGlow,
          boxShadow: useTransform(seamGlow, (v) => `0 0 ${v * 20}px rgba(107,143,113,${v * 0.3})`),
        }}
        aria-hidden="true"
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ opacity: revealOpacity }}
      >
        <span className="text-xl font-medium text-cove-charcoal bg-cove-offwhite/90 px-5 py-2 rounded-lg">
          The difference is calm.
        </span>
      </motion.div>
    </section>
  );
}
