"use client";

import { motion } from "framer-motion";

const QUOTES = [
  {
    text: "Finally something that doesn't make me feel broken. The companion just... gets it.",
    name: "Maya",
    role: "College student with ADHD",
    color: "#7EAAA0",
  },
  {
    text: "My ADHD brain actually likes using this. The streaks don't punish me and the voice capture is a game changer.",
    name: "Sam",
    role: "Freelance designer",
    color: "#6B8F71",
  },
  {
    text: "I tried every productivity app out there. Cove is the first one that stayed on my phone past a week.",
    name: "Jordan",
    role: "Graduate researcher",
    color: "#C4A055",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-24 bg-[#F7F5F0]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Community</span>
          <h2 className="text-3xl font-semibold text-[#3D3832] tracking-tight mt-3">
            Built for brains like yours.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((quote, i) => (
            <motion.div
              key={quote.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-[#E5E0D8] bg-white p-6 flex flex-col"
            >
              <div className="text-2xl mb-4" style={{ color: quote.color }}>&ldquo;</div>
              <p className="text-sm text-[#3D3832] leading-relaxed flex-1 italic">
                {quote.text}
              </p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E5E0D8]/50">
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
    </section>
  );
}
