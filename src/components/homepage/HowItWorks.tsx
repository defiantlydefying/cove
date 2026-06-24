"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Capture everything",
    description: "Voice or text — dump your thoughts into the companion. It sorts them into tasks, reminders, and notes without you lifting a finger.",
    color: "#7EAAA0",
  },
  {
    number: "02",
    title: "Plan your day",
    description: "Drag tasks onto your week calendar. Use Inbox → Today → Upcoming → Someday to decide what matters now and what can wait.",
    color: "#6B8F71",
  },
  {
    number: "03",
    title: "Build momentum",
    description: "Complete tasks, log focus sessions, check in on wellness. Watch your streak grow and your level rise — at your own pace.",
    color: "#C4A055",
  },
];

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="about" className="w-full py-20 md:py-28 bg-cove-offwhite border-t border-cove-border-light">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">How it works</span>
          <h2 className="font-display text-[clamp(2.5rem,5.4vw,4.4rem)] font-normal text-cove-charcoal tracking-[-0.015em] leading-[1.0] mt-5">
            Three steps to <em className="italic">calm</em>.
          </h2>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              variants={
                reduced
                  ? { hidden: {}, show: {} }
                  : {
                      hidden: { opacity: 0, y: 44, filter: "blur(10px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }
              }
              className="relative"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-cove-border to-transparent z-0" />
              )}

              <div className="relative z-10">
                <span
                  className="text-5xl font-bold tracking-tight"
                  style={{ color: `${step.color}30` }}
                >
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-cove-charcoal mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-cove-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
