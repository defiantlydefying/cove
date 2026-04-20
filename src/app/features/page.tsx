"use client";

import { motion } from "framer-motion";
import NavBar from "@/components/homepage/NavBar";
import Footer from "@/components/homepage/Footer";

const FEATURES = [
  {
    category: "Capture",
    color: "#7EAAA0",
    items: [
      {
        title: "Companion",
        description: "A gentle AI companion you talk to through voice or text. Brain dump your thoughts and it sorts them into tasks, reminders, and notes — no organizing required. Choose from 7 animal personalities, each with their own tone.",
      },
      {
        title: "Voice Capture",
        description: "Press the mic button, say what's on your mind, and let go. Cove transcribes and processes your thoughts in real time with volume-reactive visual feedback. Auto-stops after a natural pause.",
      },
      {
        title: "Quick Inbox",
        description: "Every thought lands in your inbox first. No need to decide where it goes, what priority it is, or when to do it. Just capture it. Sort later — or let the companion sort for you.",
      },
    ],
  },
  {
    category: "Plan",
    color: "#6B8F71",
    items: [
      {
        title: "Task Pipeline",
        description: "Inspired by Things 3. Tasks flow through Inbox → Today → Upcoming → Someday. Defer with one click (tomorrow, next week, someday, or pick a date). Won't Do lets you archive without guilt.",
      },
      {
        title: "Week Planner",
        description: "Todoist-style time blocking on a 7-day calendar. Drag tasks from your list onto time slots. See your week at a glance with day columns, an all-day row, and a red current-time indicator.",
      },
      {
        title: "Priority Zones",
        description: "Must Do, Should Do, Could Do — three zones below the calendar for untimed items. Drag between zones to reprioritize. Items you don't get to aren't failures, they're just 'Could Do.'",
      },
      {
        title: "AI Task Breakdown",
        description: "Overwhelmed by a big task? Hit 'Break it down' and adjust the granularity slider from broad steps to micro-steps. On a bad brain day, slide it to 5 and get tiny, embarrassingly doable steps.",
      },
    ],
  },
  {
    category: "Build",
    color: "#C4A055",
    items: [
      {
        title: "Routines",
        description: "Step-by-step daily routines with optional timers and duration tracking. Generate routines from a prompt using AI, or browse community-shared routines and import them with one click.",
      },
      {
        title: "Focus Timer",
        description: "Pomodoro-style timer with focus, short break, and long break sessions. Automatically cycles between work and rest. Earns XP toward your progress level.",
      },
      {
        title: "Habits & Goals",
        description: "Daily habits with streak tracking and weekly goals with progress bars. Link habits to goals for automatic counting. Simple checkboxes, no complex setup.",
      },
    ],
  },
  {
    category: "Reflect",
    color: "#A08BA0",
    items: [
      {
        title: "Wellness Tracker",
        description: "Log mood, energy, and sleep on a 1–5 scale. View 30-day trends and pattern analysis. Small daily check-ins that add up to real self-awareness over time.",
      },
      {
        title: "Streaks & Progress",
        description: "Finch-inspired: earn XP, level up from Seedling to Legendary, and maintain streaks with a real Mon–Sun week view. Miss a day? Nothing breaks. Your streak pauses, not punishes.",
      },
      {
        title: "Achievements",
        description: "Unlock milestones as you build consistency. First task, 7-day streak, 50 focus sessions — small celebrations that keep you going without pressure.",
      },
    ],
  },
  {
    category: "Connect",
    color: "#C4795B",
    items: [
      {
        title: "Community Routines",
        description: "An opt-in library where users share routines pseudonymously. Browse by tags, mark routines as helpful, report if needed. No profiles, no comments, no pressure.",
      },
      {
        title: "Reminders",
        description: "Schedule gentle nudges — daily, weekly, or on specific days. Natural language parsing ('every weekday at 9am'). Browser notifications and native push on mobile.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* Hero */}
        <section className="relative w-full pt-32 pb-20 bg-[#1C1B18] overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] right-[10%]" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs font-medium tracking-widest uppercase text-cove-accent mb-4"
            >
              Features
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-semibold text-[#E5E0D8] tracking-tight leading-tight"
            >
              Everything you need,
              <br />
              <span className="text-cove-accent">nothing you don&apos;t.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#E5E0D8]/40 mt-6 max-w-xl mx-auto leading-relaxed"
            >
              Every module is opt-in. Start with what you need, add more when it feels right.
            </motion.p>
          </div>
        </section>

        {/* Feature categories */}
        {FEATURES.map((category, ci) => (
          <section
            key={category.category}
            className={`w-full py-20 ${ci % 2 === 0 ? "bg-[#F7F5F0]" : "bg-white"}`}
          >
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: fi * 0.08 }}
                    className="rounded-2xl border border-[#E5E0D8] bg-white p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-base font-semibold text-[#3D3832] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#8A8480] leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

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
              Start for free today.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base text-[#E5E0D8]/40 mt-4"
            >
              No credit card. Free forever for personal use.
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

        <Footer />
      </main>
    </>
  );
}
