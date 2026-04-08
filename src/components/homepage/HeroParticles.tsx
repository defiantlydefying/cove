"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import ParticleCanvas from "./ParticleCanvas";
import CharacterReveal from "./CharacterReveal";
import CoveLogo from "./CoveLogo";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function HeroParticles() {
  const [formed, setFormed] = useState(false);
  const reduced = useReducedMotion();
  const handleFormationComplete = useCallback(() => setFormed(true), []);

  // Fallback: ensure text shows even if particle animation doesn't complete
  useEffect(() => {
    if (formed) return;
    const timer = setTimeout(() => setFormed(true), 5000);
    return () => clearTimeout(timer);
  }, [formed]);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1C1B18]">
      {/* Gradient mesh underneath */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute w-[400px] h-[400px] rounded-full top-[10%] left-[15%]" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.08) 0%, transparent 70%)", filter: "blur(40px)", animation: "meshMove1 8s ease-in-out infinite alternate" }} />
        <div className="absolute w-[350px] h-[350px] rounded-full top-[40%] right-[10%]" style={{ background: "radial-gradient(circle, rgba(126,170,160,0.06) 0%, transparent 70%)", filter: "blur(40px)", animation: "meshMove2 10s ease-in-out infinite alternate" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full bottom-[15%] left-[30%]" style={{ background: "radial-gradient(circle, rgba(196,160,85,0.05) 0%, transparent 70%)", filter: "blur(40px)", animation: "meshMove3 9s ease-in-out infinite alternate" }} />
      </div>

      {/* Particle canvas */}
      {reduced ? (
        <div className="relative z-10 flex flex-col items-center">
          <CoveLogo size={56} />
        </div>
      ) : (
        <ParticleCanvas onFormationComplete={handleFormationComplete} />
      )}

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-4">
        {(formed || reduced) && (
          <>
            <CharacterReveal
              text="Your brain works differently."
              as="h1"
              className="text-[clamp(1.8rem,4vw,2.8rem)] font-medium tracking-tight leading-[1.15] text-[#E5E0D8] max-w-[520px]"
              delay={0}
            />
            <CharacterReveal
              text="We built something that works with it."
              as="h1"
              className="text-[clamp(1.8rem,4vw,2.8rem)] font-medium tracking-tight leading-[1.15] text-[#E5E0D8] max-w-[520px] mt-1"
              delay={0.8}
            />
            <motion.p
              initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.0 }}
              className="text-[clamp(0.9rem,1.5vw,1.05rem)] text-[rgba(229,224,216,0.5)] mt-4 max-w-[400px]"
            >
              An executive function companion that moves at your pace.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.4 }}
              className="mt-7"
            >
              <a
                href="/register"
                className="inline-block px-9 py-3.5 rounded-xl bg-cove-accent text-cove-sidebar-text font-medium text-sm hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 2px 12px rgba(107,143,113,0.2)" }}
              >
                Find your cove
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Floating keyword tags */}
      {(formed || reduced) && (
        <div className="absolute inset-0 z-[8] pointer-events-none hidden md:block" aria-hidden="true">
          {[
            { text: "autonomy", pos: "top-[18%] left-[10%]", color: "#6B8F71", bg: "rgba(107,143,113,0.08)", border: "rgba(107,143,113,0.15)", delay: 2.8 },
            { text: "your pace", pos: "top-[25%] right-[12%]", color: "#7EAAA0", bg: "rgba(126,170,160,0.08)", border: "rgba(126,170,160,0.15)", delay: 3.1 },
            { text: "gentle", pos: "bottom-[28%] left-[14%]", color: "#A08BA0", bg: "rgba(160,139,160,0.08)", border: "rgba(160,139,160,0.15)", delay: 3.4 },
            { text: "progress", pos: "bottom-[20%] right-[8%]", color: "#C4A055", bg: "rgba(196,160,85,0.08)", border: "rgba(196,160,85,0.15)", delay: 3.7 },
            { text: "calm", pos: "top-[55%] left-[5%]", color: "#8FA89A", bg: "rgba(143,168,154,0.08)", border: "rgba(143,168,154,0.15)", delay: 4.0 },
          ].map((tag) => (
            <motion.span
              key={tag.text}
              className={`absolute ${tag.pos} px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-[10px]`}
              style={{ color: tag.color, background: tag.bg, border: `1px solid ${tag.border}` }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", y: [0, -6, 3, -6] }}
              transition={{
                opacity: { duration: 0.8, delay: tag.delay },
                filter: { duration: 0.8, delay: tag.delay },
                y: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: tag.delay },
              }}
            >
              {tag.text}
            </motion.span>
          ))}
        </div>
      )}
    </section>
  );
}
