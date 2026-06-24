"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function FinalCTA() {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full py-32 relative overflow-hidden border-t border-cove-border-light"
      style={{ background: "linear-gradient(135deg, #EAF0EB 0%, #F2EDE5 100%)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.h2
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-[clamp(2.8rem,7vw,5.6rem)] font-normal text-cove-charcoal tracking-[-0.015em] leading-[0.98]"
        >
          Your calm starts <em className="italic">here</em>.
        </motion.h2>

        <motion.p
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-cove-muted mt-5 max-w-md mx-auto leading-relaxed"
        >
          No credit card required. Set up in under a minute.
        </motion.p>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <a
            href="/register"
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cove-accent text-white font-medium text-base hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-cove-accent/20"
          >
            Start your cove
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
