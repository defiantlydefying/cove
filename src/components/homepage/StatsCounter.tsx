"use client";

import { motion } from "framer-motion";
import RollingDigit from "./RollingDigit";

const STATS = [
  { digits: [1, 2], suffix: "k+", label: "tasks completed", color: "#6B8F71" },
  { digits: [9, 4], suffix: "%", label: "felt less overwhelmed", color: "#7EAAA0" },
  { digits: [4], suffix: ".9", label: "average rating", color: "#C4A055" },
];

export default function StatsCounter() {
  return (
    <section className="w-full py-24 bg-cove-offwhite">
      <div className="max-w-3xl mx-auto flex items-start justify-center gap-16 md:gap-24 px-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <div className="flex items-baseline">
              {stat.digits.map((d, j) => (
                <RollingDigit key={j} digit={d} />
              ))}
              <span className="text-2xl font-semibold tabular-nums" style={{ color: stat.color }}>
                {stat.suffix}
              </span>
            </div>
            <p className="text-xs text-cove-muted text-center mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
