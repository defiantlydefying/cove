"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";

interface TourStep {
  target: string; // CSS selector for the element to spotlight
  title: string;
  description: string;
  tabSwitch?: string; // tab ID to switch to before showing this step
  sidebarAction?: "open" | "close";
}

const STEPS: TourStep[] = [
  {
    target: "#nav-daily-view",
    title: "Daily View",
    description:
      "Your home base. See tasks, routines, wellness, and reminders at a glance.",
    tabSwitch: "daily-view",
    sidebarAction: "close",
  },
  {
    target: "#sidebar-toggle",
    title: "Tasks Sidebar",
    description:
      "Your tasks live here. Tap this button to open or close the task panel anytime.",
    sidebarAction: "close",
  },
  {
    target: "#nav-productivity",
    title: "Planner",
    description:
      "A week calendar with time blocking and priority zones — plan your days visually.",
    tabSwitch: "productivity",
  },
  {
    target: "#nav-focus-habits",
    title: "Focus & Habits",
    description:
      "Pomodoro focus timer, daily habits, and weekly goals to build consistency.",
    tabSwitch: "focus-habits",
  },
  {
    target: "#nav-routines",
    title: "Routines",
    description:
      "Build step-by-step routines with optional timers, or generate one with AI.",
    tabSwitch: "routines",
  },
  {
    target: "#nav-wellness",
    title: "Wellness",
    description:
      "Track your mood, energy, and sleep. Small check-ins that add up over time.",
    tabSwitch: "wellness",
  },
  {
    target: "#nav-reminders",
    title: "Reminders",
    description:
      "Set gentle nudges for anything — daily, weekly, or on specific days.",
    tabSwitch: "reminders",
  },
  {
    target: "#nav-gamification",
    title: "Progress",
    description:
      "Earn XP, maintain streaks, and unlock achievements as you build consistency.",
    tabSwitch: "gamification",
  },
  {
    target: "#nav-community",
    title: "Community",
    description:
      "Browse routines shared by others, or publish your own. Completely optional.",
    tabSwitch: "community",
  },
  {
    target: "#nav-settings",
    title: "Make It Yours",
    description:
      "Customize your dashboard, toggle modules on or off, and adjust your theme in Settings.",
    tabSwitch: "settings",
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
  placement: "below" | "above";
}

function getRect(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function calcTooltipPos(
  spot: SpotlightRect,
  tooltipW: number,
  tooltipH: number
): TooltipPos {
  const pad = 12;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  // Prefer below the spotlight
  let placement: "below" | "above" = "below";
  let top = spot.top + spot.height + pad;

  if (top + tooltipH > viewH - 20) {
    // Not enough room below, go above
    placement = "above";
    top = spot.top - tooltipH - pad;
  }

  // Center horizontally relative to spotlight, clamped to viewport
  let left = spot.left + spot.width / 2 - tooltipW / 2;
  left = Math.max(16, Math.min(left, viewW - tooltipW - 16));

  return { top, left, placement };
}

interface GuidedTourProps {
  setActiveTab: (tab: string) => void;
  setSidebarVisible: (visible: boolean) => void;
}

export default function GuidedTour({
  setActiveTab,
  setSidebarVisible,
}: GuidedTourProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(-1); // -1 = welcome screen, 0+ = tour steps
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Check if tour should show
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      setShow(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  // Position spotlight + tooltip when step changes
  const updatePositions = useCallback(() => {
    if (step < 0 || step >= STEPS.length) {
      setSpotlight(null);
      setTooltipPos(null);
      return;
    }

    const currentStep = STEPS[step];
    const rect = getRect(currentStep.target);
    if (!rect) {
      setSpotlight(null);
      setTooltipPos(null);
      return;
    }

    // Add padding around the spotlight
    const padX = 8;
    const padY = 6;
    const padded = {
      top: rect.top - padY,
      left: rect.left - padX,
      width: rect.width + padX * 2,
      height: rect.height + padY * 2,
    };
    setSpotlight(padded);

    // Calculate tooltip position
    const tooltipEl = tooltipRef.current;
    const tooltipW = tooltipEl?.offsetWidth || 340;
    const tooltipH = tooltipEl?.offsetHeight || 160;
    setTooltipPos(calcTooltipPos(padded, tooltipW, tooltipH));
  }, [step]);

  // When step changes, perform actions then position
  useEffect(() => {
    if (!show || step < 0) return;
    if (step >= STEPS.length) {
      setShow(false);
      return;
    }

    const currentStep = STEPS[step];

    // Perform sidebar action
    if (currentStep.sidebarAction === "open") {
      setSidebarVisible(true);
    } else if (currentStep.sidebarAction === "close") {
      setSidebarVisible(false);
    }

    // Perform tab switch
    if (currentStep.tabSwitch) {
      setActiveTab(currentStep.tabSwitch);
    }

    // Wait for DOM to settle, then position
    const timer = setTimeout(updatePositions, 150);
    return () => clearTimeout(timer);
  }, [show, step, setActiveTab, setSidebarVisible, updatePositions]);

  // Recalculate on resize
  useEffect(() => {
    if (!show || step < 0) return;
    const handleResize = () => updatePositions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [show, step, updatePositions]);

  // Recalculate after tooltip renders (so we have its actual size)
  useEffect(() => {
    if (!show || step < 0 || !spotlight) return;
    const frame = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(frame);
    // Only re-run when spotlight first appears for a step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, step, !!spotlight]);

  const dismiss = useCallback(() => {
    setShow(false);
    setStep(-1);
    setSpotlight(null);
    // Return to daily view
    setActiveTab("daily-view");
    localStorage.setItem("cove-tour-done", "1");
  }, [setActiveTab]);

  const advance = useCallback(() => {
    if (step === -1) {
      setStep(0);
    } else if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, dismiss]);

  if (!show) return null;

  const name = session?.user?.name || "there";
  const isWelcome = step === -1;
  const isLast = step === STEPS.length - 1;
  const totalSteps = STEPS.length;

  // Welcome screen (centered modal, no spotlight)
  if (isWelcome) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 bg-cove-card border border-cove-border rounded-2xl shadow-2xl overflow-hidden animate-soft-bounce">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-cove-charcoal">
              Welcome, {name}
            </h2>
            <p className="text-sm text-cove-muted mt-1 leading-relaxed">
              Let&apos;s take a quick look around so you know where everything
              is. This will only take a moment.
            </p>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-cove-border/30">
            <button
              onClick={dismiss}
              className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Skip
            </button>
            <button
              onClick={advance}
              className="px-5 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
            >
              Show me around
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Tour overlay with spotlight
  const clipPath = spotlight
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${spotlight.left}px ${spotlight.top}px,
        ${spotlight.left}px ${spotlight.top + spotlight.height}px,
        ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px,
        ${spotlight.left + spotlight.width}px ${spotlight.top}px,
        ${spotlight.left}px ${spotlight.top}px
      )`
    : undefined;

  return createPortal(
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[60] transition-all duration-300"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          clipPath,
        }}
      />

      {/* Spotlight border glow */}
      {spotlight && (
        <div
          className="fixed z-[61] rounded-xl pointer-events-none transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow:
              "0 0 0 3px rgba(126, 170, 160, 0.5), 0 0 20px rgba(126, 170, 160, 0.2)",
          }}
        />
      )}

      {/* Tooltip */}
      {tooltipPos && step >= 0 && step < STEPS.length && (
        <div
          ref={tooltipRef}
          className="fixed z-[62] w-[340px] bg-cove-card border border-cove-border rounded-xl shadow-2xl animate-soft-bounce"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          <div className="px-5 pt-4 pb-3">
            <p className="text-[10px] font-medium text-cove-accent uppercase tracking-wider mb-1">
              {step + 1} of {totalSteps}
            </p>
            <h3 className="text-base font-bold text-cove-charcoal">
              {STEPS[step].title}
            </h3>
            <p className="text-sm text-cove-muted mt-1 leading-relaxed">
              {STEPS[step].description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 pb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "bg-cove-accent w-4"
                    : i < step
                    ? "bg-cove-accent/40 w-1.5"
                    : "bg-cove-border w-1.5"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-cove-border/30">
            <button
              onClick={dismiss}
              className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Skip
            </button>
            <button
              onClick={advance}
              className="px-5 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
            >
              {isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
