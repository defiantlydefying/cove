"use client";

import { motion, useReducedMotion } from "framer-motion";

const FEATURES = [
  {
    label: "Companion",
    title: "A friend who gets it",
    description: "Talk to your companion through voice or text. Brain dump your thoughts, and it sorts them into tasks, reminders, and check-ins — no organizing required.",
    color: "#7EAAA0",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    mockup: (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E0D8]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#7EAAA0]/15" />
          <div>
            <div className="text-[10px] font-medium text-[#3D3832]">Otter</div>
            <div className="text-[8px] text-[#A09A90]">Your companion</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-[#F7F5F0] rounded-lg px-3 py-2 text-[9px] text-[#6B6560] max-w-[80%]">
            Sounds like a busy day ahead! I&apos;ve added &ldquo;finish essay&rdquo; and &ldquo;call mom&rdquo; to your inbox.
          </div>
          <div className="bg-[#6B8F71]/10 rounded-lg px-3 py-2 text-[9px] text-[#3D3832] max-w-[75%] ml-auto">
            thanks, also remind me to take my meds at 2pm
          </div>
          <div className="bg-[#F7F5F0] rounded-lg px-3 py-2 text-[9px] text-[#6B6560] max-w-[80%]">
            Done! Reminder set for 2:00 PM. You&apos;re on it today.
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Planner",
    title: "See your week at a glance",
    description: "A visual calendar with time blocking. Drag tasks onto your schedule, prioritize with Must Do / Should Do / Could Do zones, and see where your time goes.",
    color: "#6B8F71",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    mockup: (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E5E0D8]">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
            <div key={d} className="text-center">
              <div className="text-[7px] text-[#A09A90]">{d}</div>
              <div className={`text-[9px] font-medium mt-0.5 w-5 h-5 flex items-center justify-center rounded-full mx-auto ${i === 2 ? "bg-[#6B8F71] text-white" : "text-[#3D3832]"}`}>{14 + i}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex gap-1">
            <div className="text-[7px] text-[#A09A90] w-6 text-right pt-0.5">9am</div>
            <div className="flex-1 bg-[#6B8F71] text-white rounded px-1.5 py-1 text-[8px]">Deep work</div>
            <div className="flex-1" />
            <div className="flex-1 bg-[#C4A055] text-white rounded px-1.5 py-1 text-[8px]">Meeting</div>
            <div className="flex-1" />
            <div className="flex-1 bg-[#6B8F71] text-white rounded px-1.5 py-1 text-[8px]">Write</div>
          </div>
          <div className="flex gap-1">
            <div className="text-[7px] text-[#A09A90] w-6 text-right pt-0.5">11a</div>
            <div className="flex-1" />
            <div className="flex-1 bg-[#7B68AE] text-white rounded px-1.5 py-1 text-[8px]">Review</div>
            <div className="flex-1" />
            <div className="flex-1 bg-[#C4A055] text-white rounded px-1.5 py-1 text-[8px]">Call</div>
            <div className="flex-1" />
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Progress",
    title: "Streaks that never shame you",
    description: "Earn XP, level up, and maintain streaks — but miss a day and nothing breaks. Finch-inspired: gentle momentum, not guilt.",
    color: "#C4A055",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    mockup: (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E0D8]">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-[#C4A055]">12</span>
          <span className="text-[9px] text-[#A09A90]">day streak</span>
        </div>
        <div className="flex gap-1 mb-3">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-6 rounded-md flex items-center justify-center ${i < 5 ? "bg-[#C4A055] text-white" : "bg-[#F0ECE4]"}`}>
                {i < 5 && <span className="text-[8px]">&#x2713;</span>}
              </div>
              <span className="text-[7px] text-[#A09A90]">{d}</span>
            </div>
          ))}
        </div>
        <div className="text-[8px] text-[#6B6560]">Keep showing up. You&apos;re building something real.</div>
      </div>
    ),
  },
];

export default function FeatureShowcase() {
  const reduced = useReducedMotion();

  return (
    <section id="features" className="w-full py-24 bg-[#F7F5F0]" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Features</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#3D3832] tracking-tight mt-3">
            Everything you need,<br />nothing you don&apos;t.
          </h2>
          <p className="text-base text-[#A09A90] mt-4 max-w-lg mx-auto">
            Every module is opt-in. Turn on what helps, turn off what doesn&apos;t. Cove adapts to you.
          </p>
        </motion.div>

        {/* Alternating layout instead of uniform 3-grid */}
        <div className="flex flex-col gap-16">
          {FEATURES.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <motion.div
                key={feature.label}
                initial={reduced ? {} : { opacity: 0, x: isReversed ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isReversed ? "md:direction-rtl" : ""}`}
              >
                {/* Mockup side */}
                <div className={`rounded-2xl border border-[#E5E0D8] bg-white overflow-hidden ${isReversed ? "md:order-2" : ""}`}>
                  <div className="p-5 bg-[#FAFAF8]">
                    {feature.mockup}
                  </div>
                </div>

                {/* Text side */}
                <div className={`flex flex-col ${isReversed ? "md:order-1 md:items-end md:text-right" : ""}`}>
                  <div className={`flex items-center gap-2 mb-4 ${isReversed ? "md:flex-row-reverse" : ""}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${feature.color}15`, color: feature.color }}>
                      {feature.icon}
                    </div>
                    <span className="text-xs font-medium tracking-wider uppercase" style={{ color: feature.color }}>
                      {feature.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#3D3832] mb-3">{feature.title}</h3>
                  <p className="text-sm text-[#8A8480] leading-relaxed max-w-md">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
