"use client";

import { useState } from "react";
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
  const [toggles, setToggles] = useState([
    { label: "Routines", on: true },
    { label: "Wellness", on: true },
    { label: "Reminders", on: false },
    { label: "Community", on: false },
  ]);

  const handleToggle = (index: number) => {
    setToggles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, on: !item.on } : item))
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.65rem] font-semibold mb-1" style={{ color: "#7EAAA0" }}>
        You choose what shows up
      </p>
      {toggles.map((item, i) => (
        <button
          key={item.label}
          onClick={() => handleToggle(i)}
          className="flex items-center justify-between text-[0.6rem] w-full text-left"
          style={{ color: "#3D3832" }}
        >
          <span style={{ opacity: item.on ? 1 : 0.5 }}>{item.label}</span>
          <div
            className="w-7 h-4 rounded-full relative transition-colors"
            style={{ background: item.on ? "#7EAAA0" : "rgba(61,56,50,0.12)" }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all"
              style={{ left: item.on ? 14 : 2 }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function TasksDemo() {
  const [tasks, setTasks] = useState([
    { text: "Morning stretch", done: true },
    { text: "Review today's plan", done: false },
    { text: "10 min focus session", done: false },
  ]);

  const handleToggle = (index: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
    );
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-semibold mb-1" style={{ color: "#6B8F71" }}>
          Designed to feel obvious
        </p>
        <span className="text-[0.55rem] font-medium" style={{ color: "#6B8F71" }}>
          {doneCount}/{tasks.length}
        </span>
      </div>
      {tasks.map((t, i) => (
        <button
          key={t.text}
          onClick={() => handleToggle(i)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.6rem] w-full text-left transition-all"
          style={{
            background: t.done ? "rgba(107,143,113,0.12)" : "rgba(107,143,113,0.04)",
            border: "1px solid rgba(107,143,113,0.12)",
          }}
        >
          <div
            className="w-3 h-3 rounded-sm flex items-center justify-center text-[0.45rem] transition-all shrink-0"
            style={{
              background: t.done ? "#6B8F71" : "transparent",
              border: t.done ? "none" : "1.5px solid rgba(107,143,113,0.3)",
              color: "white",
            }}
          >
            {t.done && "\u2713"}
          </div>
          <span style={{ color: t.done ? "#9A928A" : "#3D3832", textDecoration: t.done ? "line-through" : "none" }}>
            {t.text}
          </span>
        </button>
      ))}
    </div>
  );
}

function MoodDemo() {
  const [selected, setSelected] = useState(2);
  const faces = ["\uD83D\uDE14", "\uD83D\uDE10", "\uD83D\uDE42", "\uD83D\uDE0A"];
  const labels = ["Rough", "Okay", "Good", "Great"];

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[0.65rem] font-semibold mb-1" style={{ color: "#A08BA0" }}>
        Built for how you actually think
      </p>
      <div className="flex gap-2.5">
        {faces.map((face, i) => (
          <button
            key={face}
            onClick={() => setSelected(i)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
            style={{
              border: i === selected ? "2px solid #A08BA0" : "2px solid transparent",
              background: i === selected ? "rgba(160,139,160,0.15)" : "transparent",
              transform: i === selected ? "scale(1.15)" : "scale(1)",
            }}
          >
            {face}
          </button>
        ))}
      </div>
      <p className="text-[0.55rem] font-medium" style={{ color: "#A08BA0" }}>
        {labels[selected]}
      </p>
    </div>
  );
}

function StreakDemo() {
  const [streak, setStreak] = useState(7);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[0.65rem] font-semibold mb-1" style={{ color: "#C4A055" }}>
        Progress without pressure
      </p>
      <div className="flex items-baseline gap-0.5">
        <RollingDigit digit={streak} />
      </div>
      <p className="text-[0.5rem]" style={{ color: "#9A928A" }}>day streak</p>
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i < streak ? "#C4A055" : "rgba(196,160,85,0.2)" }}
          />
        ))}
      </div>
      <button
        onClick={() => setStreak((s) => (s >= 7 ? 1 : s + 1))}
        className="mt-1 px-3 py-1 text-[0.55rem] font-medium rounded-full transition-colors"
        style={{ color: "#C4A055", border: "1px solid rgba(196,160,85,0.3)", background: "rgba(196,160,85,0.08)" }}
      >
        +1 day
      </button>
    </div>
  );
}
