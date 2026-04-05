"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function ParallaxLandscape() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  const farY = useTransform(scrollYProgress, [0, 1], [60, -30]);
  const midY = useTransform(scrollYProgress, [0, 1], [40, -50]);
  const nearY = useTransform(scrollYProgress, [0, 1], [20, -70]);
  const sunY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const coveScale = useTransform(scrollYProgress, [0.3, 0.8], [1, 1.8]);
  const coveGlow = useTransform(scrollYProgress, [0.3, 0.8], [0.2, 0.5]);
  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);

  return (
    <motion.section
      ref={ref}
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1C1B18 0%, #EAF0EB 30%, #F7F5F0 100%)",
        opacity,
      }}
    >
      <motion.div
        className="absolute top-[15%] right-[15%] w-[60px] h-[60px] rounded-full"
        style={{
          y: reduced ? 0 : sunY,
          background: "radial-gradient(circle, rgba(196,160,85,0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        className="absolute bottom-0 left-[-10%] w-[120%] h-[45%]"
        style={{ y: reduced ? 0 : farY }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,200 L100,100 L200,140 L350,50 L480,120 L600,30 L750,110 L880,60 L1000,130 L1100,80 L1200,200 Z" fill="rgba(143,168,154,0.15)" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-[-5%] w-[110%] h-[38%]"
        style={{ y: reduced ? 0 : midY }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 180" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,180 L120,90 L250,130 L380,45 L520,110 L650,25 L780,100 L900,55 L1050,120 L1200,180 Z" fill="rgba(107,143,113,0.2)" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-[10%] w-full flex justify-around px-10"
        style={{ y: reduced ? 0 : midY }}
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 0, height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderBottom: `20px solid rgba(90,125,96,${0.2 + (i % 3) * 0.08})`,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-full h-[30%]"
        style={{ y: reduced ? 0 : nearY }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,150 L80,80 L200,110 L320,40 L450,90 L570,20 L700,80 L830,50 L950,100 L1100,60 L1200,150 Z" fill="rgba(107,143,113,0.3)" />
        </svg>
      </motion.div>

      <div className="absolute bottom-0 w-full h-[8%] bg-gradient-to-b from-[rgba(107,143,113,0.35)] to-[rgba(90,125,96,0.4)]" aria-hidden="true" />

      <motion.div
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[60px] h-[30px] rounded-t-full"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(74,93,78,0.6) 0%, rgba(74,93,78,0.2) 80%)",
          scale: reduced ? 1 : coveScale,
          boxShadow: useTransform(coveGlow, (v) => `0 0 ${v * 50}px rgba(107,143,113,${v})`),
        }}
        aria-hidden="true"
      />

      <motion.p
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 text-xs text-[rgba(61,56,50,0.4)]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ↓ scroll to enter the cove
      </motion.p>
    </motion.section>
  );
}
