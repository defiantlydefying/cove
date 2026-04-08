"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useProductivity } from "./ProductivityContext";
import { useToast } from "@/components/providers/ToastProvider";
import { success as hapticSuccess } from "@/lib/capacitor/haptics";

const DURATIONS = {
  focus: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

const SESSION_LABELS: Record<string, string> = {
  focus: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 587;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

export default function FocusTimer() {
  const { focusSessions, addFocusSession } = useProductivity();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState<"focus" | "short-break" | "long-break" | "custom">("focus");
  const [timeRemaining, setTimeRemaining] = useState(DURATIONS.focus);
  const [sessionDuration, setSessionDuration] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [label, setLabel] = useState("");
  const [focusCount, setFocusCount] = useState(0);
  const [customMinutes, setCustomMinutes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todaySessionCount = focusSessions.filter(
    (s) => s.sessionType === "focus"
  ).length;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleSessionComplete = useCallback(async () => {
    clearTimer();
    setIsRunning(false);
    playChime();
    hapticSuccess();

    if (sessionType === "focus" || sessionType === "custom") {
      const result = (await addFocusSession({
        label: label || null,
        taskId: null,
        durationMin: Math.round(sessionDuration / 60),
        sessionType: "focus",
      })) as Record<string, unknown> | null;

      const newCount = focusCount + 1;
      setFocusCount(newCount);

      // Show XP earned toast
      const gam = result?.gamification as { xpEarned?: number; newAchievements?: Array<{ name: string }> } | undefined;
      if (gam?.xpEarned) {
        toast(`Focus session complete  +${gam.xpEarned} XP`, "success");
      } else {
        toast("Focus session complete", "success");
      }
      if (gam?.newAchievements?.length) {
        for (const a of gam.newAchievements) {
          setTimeout(() => toast(`Achievement unlocked: ${a.name}`, "success"), 500);
        }
      }

      // Auto-advance to break
      const nextType = newCount % 4 === 0 ? "long-break" : "short-break";
      setSessionType(nextType);
      setTimeRemaining(DURATIONS[nextType]);
    } else {
      // Break complete, back to focus
      toast("Break over -- time to focus", "info");
      setSessionType("focus");
      setTimeRemaining(DURATIONS.focus);
    }
  }, [clearTimer, sessionType, sessionDuration, label, focusCount, addFocusSession, toast]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, handleSessionComplete, clearTimer]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => {
    setIsRunning(false);
    clearTimer();
  };
  const handleReset = () => {
    setIsRunning(false);
    clearTimer();
    setTimeRemaining(sessionDuration);
  };

  const switchSession = (type: "focus" | "short-break" | "long-break") => {
    setIsRunning(false);
    clearTimer();
    setSessionType(type);
    const dur = DURATIONS[type];
    setSessionDuration(dur);
    setTimeRemaining(dur);
    setCustomMinutes("");
  };

  const applyCustom = () => {
    const mins = parseInt(customMinutes, 10);
    if (!mins || mins < 1 || mins > 180) return;
    setIsRunning(false);
    clearTimer();
    setSessionType("custom");
    const dur = mins * 60;
    setSessionDuration(dur);
    setTimeRemaining(dur);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Session type tabs */}
      <div className="flex gap-1 w-full">
        {(["focus", "short-break", "long-break"] as const).map((type) => (
          <button
            key={type}
            onClick={() => switchSession(type)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              sessionType === type
                ? "bg-cove-accent text-white"
                : "text-cove-muted hover:bg-cove-offwhite"
            }`}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Custom duration input */}
      <div className="flex gap-1.5 w-full items-center">
        <input
          type="number"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") applyCustom(); }}
          placeholder="Min"
          min={1}
          max={180}
          className={`flex-1 px-2 py-1.5 text-xs text-center border rounded-lg focus:outline-none focus:ring-1 focus:ring-cove-accent text-cove-charcoal placeholder:text-cove-muted ${
            sessionType === "custom"
              ? "border-cove-accent bg-cove-accent-light"
              : "border-cove-border bg-cove-offwhite"
          }`}
        />
        <button
          onClick={applyCustom}
          disabled={!customMinutes || parseInt(customMinutes, 10) < 1}
          className="px-3 py-1.5 text-xs font-medium text-cove-accent border border-cove-accent/30 rounded-lg hover:bg-cove-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Set
        </button>
      </div>

      {/* Timer display */}
      <div className="text-5xl font-mono font-semibold text-cove-charcoal tabular-nums tracking-tight">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-6 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-2 text-sm font-medium text-cove-accent border border-cove-accent rounded-lg hover:bg-cove-accent-light transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-cove-muted border border-cove-border rounded-lg hover:bg-cove-offwhite transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Working on input */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Working on..."
        maxLength={100}
        className="w-full px-3 py-2 text-sm bg-cove-offwhite border border-cove-border rounded-lg focus:outline-none focus:ring-1 focus:ring-cove-accent text-cove-charcoal placeholder:text-cove-muted"
      />

      {/* Session count */}
      <p className="text-xs text-cove-muted">
        {todaySessionCount + (focusCount > todaySessionCount ? focusCount - todaySessionCount : 0)} sessions today
      </p>
    </div>
  );
}
