"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Tasks",
    description: "Break things down. Check them off. Feel the relief.",
    color: "text-cove-accent",
    line: "bg-cove-accent/20",
  },
  {
    title: "Routines",
    description: "Small steps, repeated. Structure that works with your brain.",
    color: "text-cove-blue",
    line: "bg-cove-blue/20",
  },
  {
    title: "Wellness",
    description: "Track your mood, energy, and sleep. Patterns become insights.",
    color: "text-cove-heather",
    line: "bg-cove-heather/20",
  },
  {
    title: "Reminders",
    description: "Gentle nudges for water, meds, breaks. Not nagging \u2014 caring.",
    color: "text-cove-amber",
    line: "bg-cove-amber/20",
  },
  {
    title: "Streaks",
    description: "Showing up matters more than being perfect. Every day counts.",
    color: "text-cove-sage",
    line: "bg-cove-sage/20",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function FeatureTicker() {
  return (
    <section className="w-full py-20 md:py-28 bg-cove-offwhite" aria-label="Features">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          className="flex flex-col"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group py-6 md:py-8"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className={`text-xs font-medium tabular-nums text-cove-muted/50 w-5 shrink-0`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg md:text-xl font-semibold tracking-tight ${feature.color} mb-1.5`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-cove-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              {i < FEATURES.length - 1 && (
                <motion.div
                  className={`mt-6 md:mt-8 h-px ${feature.line}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 * (i + 1) }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
