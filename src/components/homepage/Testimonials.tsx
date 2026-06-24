"use client";

import { motion, useReducedMotion } from "framer-motion";

const QUOTES = [
  {
    text: "Finally something that doesn't make me feel broken. The companion just... gets it.",
    name: "Maya",
    role: "College student with ADHD",
    color: "#7EAAA0",
    featured: true,
  },
  {
    text: "My ADHD brain actually likes using this. The streaks don't punish me and the voice capture is a game changer.",
    name: "Sam",
    role: "Freelance designer",
    color: "#6B8F71",
    featured: false,
  },
  {
    text: "I tried every productivity app out there. Cove is the first one that stayed on my phone past a week.",
    name: "Jordan",
    role: "Graduate researcher",
    color: "#C4A055",
    featured: false,
  },
];

export default function Testimonials() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full py-20 md:py-28 bg-cove-offwhite border-t border-cove-border-light">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Community</span>
          <h2 className="font-display text-[clamp(2.5rem,5.4vw,4.4rem)] font-normal text-cove-charcoal tracking-[-0.015em] leading-[1.0] mt-5">
            Built for brains like <em className="italic">yours</em>.
          </h2>
        </motion.div>

        {/* Asymmetric layout: featured quote large, others smaller */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Featured quote — takes 3 columns */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 48, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-3 rounded-2xl border border-[#E5E0D8] bg-white p-8 md:p-10 flex flex-col"
          >
            <div className="text-4xl mb-4" style={{ color: QUOTES[0].color }}>&ldquo;</div>
            <p className="text-lg md:text-xl text-[#3D3832] leading-relaxed flex-1 italic font-light">
              {QUOTES[0].text}
            </p>
            <div className="flex items-center gap-3 mt-8 pt-5 border-t border-[#E5E0D8]/50">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: QUOTES[0].color }}>
                {QUOTES[0].name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-[#3D3832]">{QUOTES[0].name}</p>
                <p className="text-xs text-[#A09A90]">{QUOTES[0].role}</p>
              </div>
            </div>
          </motion.div>

          {/* Smaller quotes — stacked in 2 columns */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {QUOTES.slice(1).map((quote, i) => (
              <motion.div
                key={quote.name}
                initial={reduced ? {} : { opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.12 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-6 flex flex-col flex-1"
              >
                <div className="text-2xl mb-3" style={{ color: quote.color }}>&ldquo;</div>
                <p className="text-sm text-[#3D3832] leading-relaxed flex-1 italic">
                  {quote.text}
                </p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#E5E0D8]/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: quote.color }}>
                    {quote.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3D3832]">{quote.name}</p>
                    <p className="text-[10px] text-[#A09A90]">{quote.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
