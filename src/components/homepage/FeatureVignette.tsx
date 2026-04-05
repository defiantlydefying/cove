"use client";

import RollingDigit from "./RollingDigit";

interface VignetteProps {
  type: "toggles" | "tasks" | "mood" | "streak";
}

export default function FeatureVignette({ type }: VignetteProps) {
  return (
    <div className="p-3">
      {type === "toggles" && <TogglesDemo />}
      {type === "tasks" && <TasksDemo />}
      {type === "mood" && <MoodDemo />}
      {type === "streak" && <StreakDemo />}
    </div>
  );
}

function TogglesDemo() {
  const items = [
    { label: "Routines", on: true },
    { label: "Wellness", on: true },
    { label: "Reminders", on: false },
    { label: "Community", on: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.65rem] font-semibold text-cove-blue mb-1">You choose what shows up</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-[0.6rem] text-cove-charcoal">
          <span>{item.label}</span>
          <div className="w-7 h-4 rounded-full relative" style={{ background: item.on ? "#7EAAA0" : "rgba(61,56,50,0.12)" }}>
            <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all" style={{ left: item.on ? 14 : 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksDemo() {
  const tasks = [
    { text: "Morning stretch", done: true },
    { text: "Review today's plan", done: false },
    { text: "10 min focus session", done: false },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[0.65rem] font-semibold text-cove-accent mb-1">Designed to feel obvious</p>
      {tasks.map((t) => (
        <div key={t.text} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.6rem]" style={{ background: t.done ? "rgba(107,143,113,0.08)" : "rgba(107,143,113,0.04)", border: "1px solid rgba(107,143,113,0.08)" }}>
          <div className="w-3 h-3 rounded-sm flex items-center justify-center text-[0.45rem]" style={{ background: t.done ? "#6B8F71" : "transparent", border: t.done ? "none" : "1.5px solid rgba(107,143,113,0.25)", color: "white" }}>
            {t.done && "✓"}
          </div>
          <span className={t.done ? "line-through text-cove-muted" : "text-cove-charcoal"}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

function MoodDemo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[0.65rem] font-semibold text-cove-heather mb-1">Built for how you actually think</p>
      <div className="flex gap-2.5">
        {["😔", "😐", "🙂", "😊"].map((face, i) => (
          <div key={face} className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all" style={{ border: i === 2 ? "2px solid #A08BA0" : "2px solid transparent", background: i === 2 ? "rgba(160,139,160,0.1)" : "transparent", transform: i === 2 ? "scale(1.15)" : "scale(1)" }}>
            {face}
          </div>
        ))}
      </div>
      <p className="text-[0.5rem] text-cove-heather">checking in, not checking up</p>
    </div>
  );
}

function StreakDemo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[0.65rem] font-semibold text-cove-amber mb-1">Progress without pressure</p>
      <div className="flex items-baseline gap-0.5">
        <RollingDigit digit={7} />
      </div>
      <p className="text-[0.5rem] text-cove-muted">day streak</p>
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-cove-amber" />
        ))}
      </div>
    </div>
  );
}
