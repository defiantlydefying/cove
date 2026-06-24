"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";
import NavBar from "@/components/homepage/NavBar";
import Footer from "@/components/homepage/Footer";
import LivingCoveCanvas from "@/components/homepage/LivingCoveCanvas";
import CustomCursor from "@/components/homepage/CustomCursor";
import LenisProvider from "@/components/providers/LenisProvider";

// ─── Scroll-triggered counter ───────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─── Statement reveal (character-by-character on scroll) ────────────
function StatementReveal({ text, accent }: { text: string; accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const words = text.split(" ");

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="font-display text-[clamp(2rem,4.4vw,3.6rem)] font-normal tracking-[-0.01em] leading-[1.12] text-center">
        {words.map((word, wi) => (
          <span key={wi} className="inline-block mr-[0.3em]">
            {word.split("").map((char, ci) => {
              const i = wi * 6 + ci;
              const isAccent = accent && word.toLowerCase().replace(/[.,!?]/, "") === accent.toLowerCase();
              return (
                <motion.span
                  key={ci}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: i * 0.025 }}
                  className={`inline-block ${isAccent ? "text-cove-accent" : "text-[#3D3832]"}`}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </h2>
    </div>
  );
}

// ─── Animated mini mockups ──────────────────────────────────────────

function CompanionMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const msgs = [
    { from: "user", text: "i have so much to do tomorrow and idk where to start" },
    { from: "companion", text: "Let's break it down together. I see homework, work, and McAfee — want me to turn those into tasks?" },
    { from: "user", text: "yes pls" },
  ];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-3 space-y-2">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: m.from === "user" ? 20 : -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.5 }}
          className={`rounded-lg px-3 py-2 text-[10px] leading-snug max-w-[85%] ${
            m.from === "user"
              ? "bg-cove-accent/10 text-[#3D3832] ml-auto"
              : "bg-white border border-[#E5E0D8] text-[#6B6560]"
          }`}
        >
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

function PlannerMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const blocks = [
    { day: 0, top: 0, h: 28, color: "#6B8F71", label: "Deep work" },
    { day: 2, top: 8, h: 20, color: "#C4A055", label: "Meeting" },
    { day: 1, top: 20, h: 24, color: "#7B68AE", label: "Review" },
    { day: 4, top: 4, h: 32, color: "#6B8F71", label: "Write" },
    { day: 3, top: 16, h: 20, color: "#C4A055", label: "Call" },
  ];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-3">
      <div className="flex gap-1 mb-2">
        {days.map((d, i) => (
          <div key={d} className="flex-1 text-center">
            <div className="text-[7px] text-[#A09A90]">{d}</div>
            <div className={`text-[9px] font-medium w-5 h-5 flex items-center justify-center rounded-full mx-auto mt-0.5 ${i === 2 ? "bg-cove-accent text-white" : "text-[#3D3832]"}`}>{14 + i}</div>
          </div>
        ))}
      </div>
      <div className="relative h-24">
        {blocks.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={inView ? { opacity: 1, scaleY: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
            className="absolute rounded text-white text-[7px] px-1.5 py-0.5 font-medium"
            style={{
              background: b.color,
              left: `${b.day * 20 + 1}%`,
              width: "18%",
              top: `${b.top}%`,
              height: `${b.h}%`,
              transformOrigin: "top",
            }}
          >
            {b.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StreakMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-[#C4A055]">
          {inView ? <Counter target={12} /> : "0"}
        </span>
        <span className="text-[9px] text-[#A09A90]">day streak</span>
      </div>
      <div className="flex gap-1 mb-2">
        {days.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div className={`w-full h-6 rounded-md flex items-center justify-center ${i < 5 ? "bg-[#C4A055] text-white" : "bg-[#F0ECE4]"}`}>
              {i < 5 && <span className="text-[8px]">&#x2713;</span>}
            </div>
            <span className="text-[7px] text-[#A09A90]">{d}</span>
          </motion.div>
        ))}
      </div>
      <div className="text-[8px] text-[#6B6560]">Keep showing up. You&apos;re building something real.</div>
    </div>
  );
}

function TaskPipelineMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const stages = [
    { label: "Inbox", count: 3, color: "#A09A90" },
    { label: "Today", count: 4, color: "#6B8F71" },
    { label: "Upcoming", count: 6, color: "#7EAAA0" },
    { label: "Someday", count: 2, color: "#C4A055" },
  ];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-4">
      <div className="flex items-center gap-1 mb-3">
        {stages.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
            className="flex-1 text-center"
          >
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[7px] text-[#A09A90]">{s.label}</div>
          </motion.div>
        ))}
      </div>
      {/* Arrow flow */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={inView ? { opacity: 0.3, scaleX: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
            className="flex-1 h-px bg-[#A09A90]"
          />
        ))}
      </div>
      {/* Sample tasks */}
      {["Finish essay", "Call advisor", "Plan next week"].map((t, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
          className="flex items-center gap-2 py-1"
        >
          <div className="w-3 h-3 rounded-sm border border-[#C5BFB5]" />
          <span className="text-[9px] text-[#3D3832]">{t}</span>
        </motion.div>
      ))}
    </div>
  );
}

function BreakdownMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const steps = ["Open the document", "Write the intro paragraph", "Draft 3 bullet points", "Review for 2 minutes", "Submit"];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[9px] text-[#A09A90]">Detail level</div>
        <div className="flex-1 h-1.5 rounded-full bg-[#E5E0D8]">
          <motion.div
            initial={{ width: "20%" }}
            animate={inView ? { width: "80%" } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full rounded-full bg-cove-accent"
          />
        </div>
        <div className="text-[9px] text-cove-accent font-medium">Micro</div>
      </div>
      <div className="space-y-1 mt-3">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
            className="flex items-start gap-2"
          >
            <span className="text-[8px] text-[#A09A90] mt-0.5 w-3 text-right">{i + 1}.</span>
            <span className="text-[9px] text-[#3D3832]">{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WellnessMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const data = [3, 4, 3, 5, 4, 4, 5];
  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-xl p-4">
      <div className="text-[9px] font-medium text-[#3D3832] mb-2">Mood this week</div>
      <div className="flex items-end gap-1.5 h-16">
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={inView ? { height: `${v * 20}%` } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            className="flex-1 rounded-t-sm bg-cove-accent/30"
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="flex-1 text-center text-[7px] text-[#A09A90]">{d}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup registry ────────────────────────────────────────────────
const MOCKUPS: Record<string, ReactNode> = {
  "Companion": <CompanionMockup />,
  "Task Pipeline": <TaskPipelineMockup />,
  "Week Planner": <PlannerMockup />,
  "AI Task Breakdown": <BreakdownMockup />,
  "Streaks & Progress": <StreakMockup />,
  "Wellness Tracker": <WellnessMockup />,
};

// ─── Feature data ───────────────────────────────────────────────────
const FEATURES = [
  {
    category: "Capture",
    color: "#7EAAA0",
    items: [
      { title: "Companion", description: "A gentle AI companion you talk to through voice or text. Brain dump your thoughts and it sorts them into tasks, reminders, and notes — no organizing required." },
      { title: "Voice Capture", description: "Press the mic button, say what's on your mind, and let go. Cove transcribes in real time with volume-reactive visual feedback. Auto-stops after a natural pause." },
      { title: "Quick Inbox", description: "Every thought lands in your inbox first. No need to decide where it goes or what priority it is. Just capture it. Sort later — or let the companion sort for you." },
    ],
  },
  {
    category: "Plan",
    color: "#6B8F71",
    items: [
      { title: "Task Pipeline", description: "Inspired by Things 3. Tasks flow through Inbox → Today → Upcoming → Someday. Defer with one click. Won't Do lets you archive without guilt." },
      { title: "Week Planner", description: "Todoist-style time blocking on a 7-day calendar. Drag tasks onto time slots. See your week at a glance with day columns and a current-time indicator." },
      { title: "Priority Zones", description: "Must Do, Should Do, Could Do — three zones for untimed items. Items you don't get to aren't failures, they're just 'Could Do.'" },
      { title: "AI Task Breakdown", description: "Overwhelmed? Hit 'Break it down' and adjust the granularity slider from broad steps to micro-steps. On a bad brain day, get tiny, embarrassingly doable steps." },
    ],
  },
  {
    category: "Build",
    color: "#C4A055",
    items: [
      { title: "Routines", description: "Step-by-step daily routines with optional timers. Generate routines from a prompt using AI, or browse community-shared routines and import with one click." },
      { title: "Focus Timer", description: "Pomodoro-style timer with focus, short break, and long break sessions. Automatically cycles between work and rest. Earns XP toward your level." },
      { title: "Habits & Goals", description: "Daily habits with streak tracking and weekly goals with progress bars. Link habits to goals for automatic counting." },
    ],
  },
  {
    category: "Reflect",
    color: "#A08BA0",
    items: [
      { title: "Wellness Tracker", description: "Log mood, energy, and sleep on a 1–5 scale. View 30-day trends and pattern analysis. Small daily check-ins that build real self-awareness." },
      { title: "Streaks & Progress", description: "Finch-inspired: earn XP, level up from Seedling to Legendary. Miss a day? Nothing breaks. Your streak pauses, not punishes." },
      { title: "Achievements", description: "Unlock milestones as you build consistency. First task, 7-day streak, 50 focus sessions — small celebrations that keep you going." },
    ],
  },
  {
    category: "Connect",
    color: "#C4795B",
    items: [
      { title: "Community Routines", description: "An opt-in library where users share routines pseudonymously. Browse by tags, mark routines as helpful. No profiles, no comments, no pressure." },
      { title: "Reminders", description: "Schedule gentle nudges — daily, weekly, or on specific days. Natural language parsing. Browser notifications and native push on mobile." },
    ],
  },
];

const STATEMENTS = [
  { text: "Your brain isn't broken.", accent: "broken." },
  { text: "Productivity without punishment.", accent: "punishment." },
  { text: "Show up when you can. That's enough.", accent: "enough." },
];

// ─── Stats ──────────────────────────────────────────────────────────
const STATS = [
  { value: 9, suffix: "", label: "Modules, all opt-in" },
  { value: 5, suffix: "", label: "Granularity levels for task breakdown" },
  { value: 0, suffix: "", label: "Red warning badges" },
];

// ─── Page ───────────────────────────────────────────────────────────
export default function FeaturesPage() {
  return (
    <LenisProvider>
      <div data-theme="light">
      <CustomCursor />
      <NavBar />
      <main>
        {/* Hero */}
        <section className="hero-grain relative w-full min-h-[80svh] flex items-center pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <LivingCoveCanvas />
          </div>
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(120% 85% at 50% 45%, rgba(241,236,228,0.74) 0%, rgba(241,236,228,0.44) 52%, rgba(241,236,228,0) 84%)",
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs font-medium tracking-[0.22em] uppercase text-cove-accent mb-5"
            >
              Features
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[clamp(2.8rem,6.4vw,5rem)] font-normal text-cove-charcoal tracking-[-0.01em] leading-[1.0]"
            >
              Everything you need,
              <br />
              <span className="text-shimmer italic">nothing you don&apos;t.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-lg md:text-xl text-cove-charcoal/75 mt-7 max-w-xl mx-auto leading-relaxed"
            >
              Every module is opt-in. Start with what you need, add more when it feels right.
            </motion.p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="w-full py-12 bg-[#F7F5F0] border-b border-[#E5E0D8]">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-cove-accent tabular-nums">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-[#A09A90] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature categories with mockups and statements */}
        {FEATURES.map((category, ci) => (
          <div key={category.category}>
            <section className={`w-full py-20 ${ci % 2 === 0 ? "bg-[#F7F5F0]" : "bg-white"}`}>
              <div className="max-w-5xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3 mb-10"
                >
                  <div className="w-1.5 h-8 rounded-full" style={{ background: category.color }} />
                  <h2 className="text-2xl font-semibold text-[#3D3832] tracking-tight">
                    {category.category}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((feature, fi) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.85, delay: fi * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-2xl border border-[#E5E0D8] bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Animated mockup if available */}
                      {MOCKUPS[feature.title] && (
                        <div className="p-3 border-b border-[#E5E0D8]/50">
                          {MOCKUPS[feature.title]}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-[#3D3832] mb-2">{feature.title}</h3>
                        <p className="text-sm text-[#8A8480] leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Statement reveal between categories */}
            {ci < STATEMENTS.length && (
              <section className={`w-full ${ci % 2 === 0 ? "bg-white" : "bg-[#F7F5F0]"}`}>
                <StatementReveal text={STATEMENTS[ci].text} accent={STATEMENTS[ci].accent} />
              </section>
            )}
          </div>
        ))}

        {/* CTA */}
        <section
          className="w-full py-24 relative overflow-hidden border-t border-cove-border-light"
          style={{ background: "linear-gradient(135deg, #EAF0EB 0%, #F2EDE5 100%)" }}
        >
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
              <div className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display text-[clamp(2.8rem,7vw,5.6rem)] font-normal text-cove-charcoal tracking-[-0.015em] leading-[0.98]"
            >
              Get started <em className="italic">today</em>.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base text-cove-muted mt-4"
            >
              No credit card required. Set up in under a minute.
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
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cove-accent text-white font-medium text-base hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-cove-accent/20"
              >
                Start your cove
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </a>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
      </div>
    </LenisProvider>
  );
}
