"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import LivingCoveCanvas from "./LivingCoveCanvas";
import MagneticElement from "./MagneticElement";

/* ── Split-text animation helpers ── */

function SplitWords({
  text,
  accentWord,
  ready,
  baseDelay,
}: {
  text: string;
  accentWord?: string;
  ready: boolean;
  baseDelay: number;
}) {
  return text.split(" ").map((word, i) => {
    const delay = baseDelay + i * 0.09;
    return (
      <span
        key={i}
        className="inline-block mr-[0.28em] leading-[1.04]"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(0.4em)",
          transitionProperty: "opacity, transform",
          transitionDuration: "1s",
          transitionDelay: `${delay}s`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "opacity, transform",
        }}
      >
        {word === accentWord ? <span className="text-shimmer italic">{word}</span> : word}
      </span>
    );
  });
}

function SplitText({
  children,
  accentWord,
  afterAccent,
}: {
  children: string;
  accentWord?: string;
  afterAccent?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const line1WordCount = children.split(" ").length;

  return (
    <span aria-label={children + (afterAccent ? " " + afterAccent : "")} suppressHydrationWarning>
      <SplitWords text={children} accentWord={accentWord} ready={ready} baseDelay={0} />
      {afterAccent && (
        <>
          <br />
          <SplitWords text={afterAccent} ready={ready} baseDelay={line1WordCount * 0.09} />
        </>
      )}
    </span>
  );
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Depth parallax — the current drifts slowest, content lifts and fades fastest,
  // so scrolling feels like sinking past layers of water.
  const canvasY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const veilOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="hero-grain relative w-full min-h-[100svh] flex items-center overflow-hidden"
      suppressHydrationWarning
    >
      {/* The living current */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: canvasY, scale: canvasScale }}
        aria-hidden="true"
      >
        <LivingCoveCanvas />
      </motion.div>

      {/* Legibility veil — soft cream wash, brightest behind the headline */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: veilOpacity,
          background:
            "radial-gradient(120% 95% at 26% 44%, rgba(241,236,228,0.72) 0%, rgba(241,236,228,0.42) 46%, rgba(241,236,228,0) 84%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.22em] uppercase text-cove-accent/90 mb-7">
              <span className="w-7 h-px bg-cove-accent/50" />
              The companion that helps you start
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(3.1rem,7.8vw,6rem)] font-normal tracking-[-0.01em] leading-[1.0] text-cove-charcoal">
            <SplitText accentWord="starting." afterAccent="Cove helps you begin.">
              The hard part isn&apos;t planning. It&apos;s starting.
            </SplitText>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="text-lg md:text-xl text-cove-charcoal/75 mt-8 max-w-xl leading-relaxed"
          >
            The calm between you and your day. A companion that holds what&apos;s on your
            mind, breaks it into steps you can actually begin, and stays until it&apos;s done.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="flex flex-wrap items-center gap-4 mt-11"
          >
            <MagneticElement>
              <a
                href="/register"
                className="group relative inline-flex items-center gap-2 px-9 py-4 rounded-full bg-cove-accent text-white font-medium text-sm tracking-wide hover:bg-cove-accent-hover transition-colors shadow-lg shadow-cove-accent/25"
              >
                Enter the cove
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </MagneticElement>
            <MagneticElement>
              <a
                href="/features"
                className="inline-block px-6 py-4 rounded-full text-cove-charcoal/70 text-sm font-medium hover:text-cove-charcoal transition-colors underline-offset-4 hover:underline"
              >
                See how it works
              </a>
            </MagneticElement>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="text-xs text-cove-muted/80 mt-5"
          >
            No credit card. Set up in under a minute.
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-cove-muted/60">
          Dive in
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-cove-muted/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-cove-muted/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
