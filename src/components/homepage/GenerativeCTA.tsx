"use client";

import { motion } from "framer-motion";
import CharacterReveal from "./CharacterReveal";
import FlowFieldCanvas from "./FlowFieldCanvas";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function GenerativeCTA() {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#1C1B18]">
      {!reduced && <FlowFieldCanvas />}

      <div
        className="absolute w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(196,121,91,0.08) 0%, transparent 65%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center">
        <CharacterReveal
          text="Find your cove."
          as="h2"
          className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-tight text-[#E5E0D8]"
          stagger={0.06}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-sm text-[rgba(229,224,216,0.5)] mt-3"
        >
          Free to start. Built to stay.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-8 relative inline-block"
        >
          {!reduced && [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 100 + i * 60,
                height: 100 + i * 60,
                border: "2px solid rgba(196,121,91,0.2)",
              }}
              animate={{ scale: [0.5, 1.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              aria-hidden="true"
            />
          ))}
          <a
            href="/register"
            className="relative z-10 inline-block px-11 py-4 rounded-2xl text-cove-sidebar-text font-medium hover:-translate-y-0.5 transition-all"
            style={{
              background: "linear-gradient(135deg, #C4795B, #B86D50)",
              boxShadow: "0 4px 20px rgba(196,121,91,0.2)",
            }}
          >
            Get started
          </a>
        </motion.div>
      </div>
    </section>
  );
}
