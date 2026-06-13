"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function SplitReveal() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full py-24 bg-cove-offwhite overflow-hidden">
      {/* Heading */}
      <motion.div
        className="text-center mb-16 px-6"
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-2xl md:text-3xl font-medium text-cove-charcoal tracking-tight">
          The difference is <span className="text-cove-accent">calm</span>.
        </p>
      </motion.div>

      {/* Side by side cards */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before card */}
        <motion.div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "linear-gradient(135deg, #A89F93, #9B9185)",
          }}
          initial={reduced ? {} : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative w-full h-20 mb-8">
            <div className="absolute top-0 left-2 w-8 h-8 rounded-lg border-2 border-white/50 rotate-12" />
            <div className="absolute top-1 right-6 w-6 h-6 rounded-full border-2 border-white/40 -rotate-6" />
            <div className="absolute bottom-0 left-10 w-10 h-6 rounded-lg border-2 border-white/50 -rotate-[8deg]" />
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-lg border-2 border-white/40 rotate-[18deg]" />
            <div className="absolute top-6 left-1/3 w-5 h-5 rounded border-2 border-white/45 rotate-45" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-3">Before</h3>
          <p className="text-sm text-white/85 leading-relaxed">
            Scattered thoughts.<br />
            Missed reminders.<br />
            That sinking feeling.
          </p>
        </motion.div>

        {/* After card */}
        <motion.div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "linear-gradient(135deg, #EEF2EC, #F2EDE5)",
          }}
          initial={reduced ? {} : { opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="flex flex-col gap-2 mb-8">
            {["Morning routine", "Deep focus", "Wellness check-in"].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5"
                initial={reduced ? {} : { opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <div className="w-5 h-5 rounded-md bg-cove-accent/25 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="#6B8F71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="h-2.5 rounded-full bg-cove-accent/10" style={{ width: `${85 - i * 12}%` }} />
              </motion.div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-cove-accent mb-3">After</h3>
          <p className="text-sm text-cove-charcoal leading-relaxed">
            Clear plan.<br />
            Gentle reminders.<br />
            Quiet confidence.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
