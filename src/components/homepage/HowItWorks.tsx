"use client";

import { motion } from "framer-motion";

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
  return (
    <section id="about" className="w-full py-24 bg-[#1C1B18]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">How it works</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#E5E0D8] tracking-tight mt-3">
            Three steps to calm.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}

              <div className="relative z-10">
                <span
                  className="text-5xl font-bold tracking-tight"
                  style={{ color: `${step.color}30` }}
                >
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-[#E5E0D8] mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#E5E0D8]/40 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
