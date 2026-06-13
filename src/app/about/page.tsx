"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import NavBar from "@/components/homepage/NavBar";
import Footer from "@/components/homepage/Footer";

function StatementReveal({ text, accent }: { text: string; accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const words = text.split(" ");

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-semibold tracking-tight leading-[1.2] text-center">
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

const VALUES = [
  {
    title: "Calm over chaos",
    description: "Productivity tools shouldn't make you more anxious. Cove uses muted colors, gentle language, and no red warning badges. Your system should feel like a sanctuary, not a source of stress.",
    color: "#6B8F71",
  },
  {
    title: "Your pace, always",
    description: "Miss a day? Your streaks pause, they don't break. Defer a task? It quietly moves to later. There's no punishment for being human — just gentle momentum when you're ready.",
    color: "#7EAAA0",
  },
  {
    title: "Opt-in everything",
    description: "Every module — tasks, routines, wellness, gamification, community — can be toggled on or off. Start with one thing. Add more when it feels right. Remove what doesn't help.",
    color: "#C4A055",
  },
  {
    title: "Built for different brains",
    description: "Cove is designed with ADHD, anxiety, and executive function challenges in mind. AI breaks tasks into micro-steps. Voice capture lets you brain dump without typing. The companion never judges.",
    color: "#A08BA0",
  },
];

const MODULES = [
  { name: "Companion", description: "A gentle AI friend that sorts your thoughts into tasks and reminders" },
  { name: "Tasks", description: "Pipeline-based system: Inbox → Today → Upcoming → Someday" },
  { name: "Planner", description: "Todoist-style week calendar with time blocking and priority zones" },
  { name: "Focus Timer", description: "Pomodoro sessions that track time and reward consistency" },
  { name: "Routines", description: "Step-by-step daily routines with optional AI generation" },
  { name: "Wellness", description: "Mood, energy, and sleep tracking with 30-day pattern analysis" },
  { name: "Reminders", description: "Flexible scheduling with natural language and push notifications" },
  { name: "Progress", description: "XP, levels, streaks, and achievements — no guilt, just momentum" },
  { name: "Community", description: "Browse and share routines pseudonymously with other users" },
];

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* Hero */}
        <section className="relative w-full pt-32 pb-24 bg-[#1C1B18] overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[20%]" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
            <div className="absolute w-[400px] h-[400px] rounded-full bottom-[10%] right-[15%]" style={{ background: "radial-gradient(circle, rgba(126,170,160,0.07) 0%, transparent 70%)", filter: "blur(80px)" }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs font-medium tracking-widest uppercase text-cove-accent mb-4"
            >
              About Cove
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-semibold text-[#E5E0D8] tracking-tight leading-tight"
            >
              A productivity app that
              <br />
              <span className="text-cove-accent">actually gets it.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#E5E0D8]/40 mt-6 max-w-xl mx-auto leading-relaxed"
            >
              Most productivity tools are built for neurotypical brains. Cove is built for the rest of us — the ones who think differently, plan differently, and need tools that meet them where they are.
            </motion.p>
          </div>
        </section>

        {/* The problem */}
        <section className="w-full py-24 bg-[#F7F5F0]">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-[#3D3832] tracking-tight mb-6">
                The problem with most productivity apps
              </h2>
              <div className="space-y-4 text-[#6B6560] leading-relaxed">
                <p>
                  They punish you for missing a day. They show angry red badges. They give you a system so complex that maintaining it becomes another task. And when you inevitably fall off, you feel worse than before you started.
                </p>
                <p>
                  For people with ADHD, anxiety, or executive function challenges, this isn&apos;t just annoying — it&apos;s actively harmful. The shame spiral of an overdue task list is one of the primary reasons people abandon productivity tools entirely.
                </p>
                <p>
                  Cove takes a different approach. We built every feature around one question: <strong className="text-[#3D3832]">does this reduce overwhelm, or add to it?</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Statement */}
        <section className="w-full bg-white">
          <StatementReveal text="You deserve tools that work with your brain, not against it." accent="with" />
        </section>

        {/* Values */}
        <section className="w-full py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Principles</span>
              <h2 className="text-3xl font-semibold text-[#3D3832] tracking-tight mt-3">
                What we believe
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {VALUES.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-1 rounded-full shrink-0" style={{ background: value.color }} />
                  <div>
                    <h3 className="text-lg font-semibold text-[#3D3832] mb-2">{value.title}</h3>
                    <p className="text-sm text-[#8A8480] leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="w-full py-24 bg-[#F7F5F0]">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Modules</span>
              <h2 className="text-3xl font-semibold text-[#3D3832] tracking-tight mt-3">
                Everything is opt-in
              </h2>
              <p className="text-base text-[#A09A90] mt-3 max-w-lg mx-auto">
                Turn on what helps. Turn off what doesn&apos;t. Start with one module and grow from there.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map((mod, i) => (
                <motion.div
                  key={mod.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl border border-[#E5E0D8] bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <h3 className="text-sm font-semibold text-[#3D3832] mb-1">{mod.name}</h3>
                  <p className="text-xs text-[#A09A90] leading-relaxed">{mod.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech + open source */}
        <section className="w-full py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-[#3D3832] tracking-tight mb-6">
                Built with care
              </h2>
              <div className="space-y-4 text-[#6B6560] leading-relaxed">
                <p>
                  Cove is built with Next.js, TypeScript, Prisma, and Tailwind CSS. It runs on PostgreSQL and supports native iOS and Android through Capacitor. The companion uses Gemini AI for task breakdown and brain dump sorting.
                </p>
                <p>
                  Every design decision — from the color palette to the animation timing — is intentional. Muted earth tones reduce visual stimulation. Rounded corners feel softer than sharp edges. Animations are gentle and can be turned off entirely.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-24 bg-[#1C1B18]">
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
              <div className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-semibold text-[#E5E0D8] tracking-tight"
            >
              Ready to try something different?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
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

        <Footer />
      </main>
    </>
  );
}
