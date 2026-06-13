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
    <section className="w-full py-24 bg-[#F7F5F0]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Community</span>
          <h2 className="text-3xl font-semibold text-[#3D3832] tracking-tight mt-3">
            Built for brains like yours.
          </h2>
        </motion.div>

        {/* Asymmetric layout: featured quote large, others smaller */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Featured quote — takes 3 columns */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
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
                initial={reduced ? {} : { opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
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
