"use client";

import { motion } from "framer-motion";
import MorphingBlob from "./MorphingBlob";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function EmpathyBreak() {
  const reduced = useReducedMotion();

  const lines = [
    { text: "You don't need to work harder.", delay: 0 },
    { text: "You don't need another system that makes you feel behind.", delay: 0.2 },
  ];

  return (
    <section id="about" className="relative w-full py-32 flex items-center justify-center overflow-hidden bg-cove-offwhite">
      <MorphingBlob className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />

      <div className="relative z-10 max-w-[560px] text-center px-6">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-normal leading-relaxed text-cove-charcoal"
            style={{ marginTop: i > 0 ? 16 : 0 }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "20%" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: line.delay }}
          >
            {line.text}
          </motion.p>
        ))}
        <motion.p
          className="text-[clamp(1.1rem,2.5vw,1.5rem)] leading-relaxed mt-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "20%" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
        >
          <span className="font-normal text-cove-charcoal">You need a space that </span>
          <span className="font-medium text-cove-accent">gets it</span>
          <span className="font-normal text-cove-charcoal">.</span>
        </motion.p>
      </div>
    </section>
  );
}
