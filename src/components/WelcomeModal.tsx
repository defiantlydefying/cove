"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const TIPS = [
  { title: "Daily View", desc: "Your home base. See tasks, routines, wellness, and reminders at a glance." },
  { title: "Productivity", desc: "Focus timer, daily planner with priority zones, habits, and weekly goals." },
  { title: "Progress", desc: "Track streaks, earn XP, level up, and unlock achievements as you go." },
  { title: "Customizable", desc: "Toggle modules on or off from the tab bar. Make Cove work for you." },
];

export default function WelcomeModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      const timer = window.setTimeout(() => setShow(true), 0);
      // Clean up URL without reload
      window.history.replaceState({}, "", "/dashboard");
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const name = session?.user?.name || "there";
  const isLast = step === TIPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-cove-card border border-cove-border rounded-2xl shadow-2xl overflow-hidden animate-soft-bounce">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          {step === 0 ? (
            <>
              <h2 className="text-xl font-bold text-cove-charcoal">
                Welcome back, {name}
              </h2>
              <p className="text-sm text-cove-muted mt-1">
                Good to see you. Here is a quick look at what Cove can do.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-medium text-cove-accent uppercase tracking-wider mb-1">
                {step} of {TIPS.length}
              </p>
              <h2 className="text-lg font-bold text-cove-charcoal">
                {TIPS[step - 1].title}
              </h2>
              <p className="text-sm text-cove-muted mt-1 leading-relaxed">
                {TIPS[step - 1].desc}
              </p>
            </>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {[0, ...TIPS.map((_, i) => i + 1)].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-cove-accent w-5" : "bg-cove-border"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cove-border/30">
          <button
            onClick={() => setShow(false)}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => {
              if (isLast) {
                setShow(false);
              } else {
                setStep((s) => s + 1);
              }
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
          >
            {step === 0 ? "Show me around" : isLast ? "Let's go" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
