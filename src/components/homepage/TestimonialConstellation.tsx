"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const TESTIMONIALS = [
  { text: "Finally something that doesn't make me feel broken.", author: "Alex", color: "linear-gradient(135deg, #6B8F71, #7EAAA0)", rotate: -2, delay: 0 },
  { text: "My ADHD brain actually likes using this.", author: "Sam", color: "linear-gradient(135deg, #A08BA0, #C4795B)", rotate: 1.5, delay: 0.15 },
  { text: "The first app I've stuck with past week one.", author: "Jordan", color: "linear-gradient(135deg, #C4A055, #C4795B)", rotate: 1, delay: 0.3 },
  { text: "It's like it was designed by someone who gets it.", author: "Taylor", color: "linear-gradient(135deg, #7EAAA0, #6B8F71)", rotate: -1.5, delay: 0.45 },
];

export default function TestimonialConstellation() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full py-20 bg-cove-offwhite overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t) => (
          <motion.div
            key={t.author}
            className="p-5 rounded-2xl"
            style={{
              background: "rgba(255,253,249,0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(61,56,50,0.06)",
              boxShadow: "0 4px 16px rgba(61,56,50,0.04)",
              rotate: reduced ? 0 : t.rotate,
            }}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: t.delay }}
          >
            <span className="text-xl text-cove-accent leading-none">&ldquo;</span>
            <p className="text-sm text-cove-charcoal italic leading-relaxed mt-1">{t.text}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-4 h-4 rounded-full" style={{ background: t.color }} />
              <span className="text-xs text-cove-muted">{t.author}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
