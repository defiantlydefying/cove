"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="w-full py-32 bg-[#1C1B18] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold text-[#E5E0D8] tracking-tight leading-tight"
        >
          Your calm starts here.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base text-[#E5E0D8]/40 mt-5 max-w-md mx-auto leading-relaxed"
        >
          Free to use. No credit card. Set up in under a minute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <a
            href="/register"
            className="inline-block px-10 py-4 rounded-xl bg-cove-accent text-white font-medium text-base hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-cove-accent/20"
          >
            Start your cove
          </a>
        </motion.div>
      </div>
    </section>
  );
}
