"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface ScheduledReminder {
  id: string;
  title: string;
  message?: string | null;
  enabled: boolean;
  scheduledTime?: string | null;
  intervalMinutes?: number | null;
  activeDays?: string;
  soundEnabled?: boolean;
  notifyEnabled?: boolean;
  snoozedUntil?: string | null;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 587;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

function shouldFire(
  reminder: ScheduledReminder,
  now: Date,
  firedSet: Set<string>
): boolean {
  if (!reminder.enabled || !reminder.scheduledTime) return false;

  if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) return false;

  const dayIndex = now.getDay();
  const activeDays = (reminder.activeDays ?? "0,1,2,3,4,5,6").split(",").map(Number);
  if (!activeDays.includes(dayIndex)) return false;

  const [schedH, schedM] = reminder.scheduledTime.split(":").map(Number);
  const nowH = now.getHours();
  const nowM = now.getMinutes();

  if (reminder.intervalMinutes) {
    const startMinutes = schedH * 60 + schedM;
    const nowMinutes = nowH * 60 + nowM;
    if (nowMinutes < startMinutes) return false;
    const elapsed = nowMinutes - startMinutes;
    if (elapsed % reminder.intervalMinutes !== 0) return false;
  } else {
    if (nowH !== schedH || nowM !== schedM) return false;
  }

  const fireKey = `${reminder.id}-${nowH}:${nowM}`;
  if (firedSet.has(fireKey)) return false;
  firedSet.add(fireKey);
  return true;
}

export default function ReminderScheduler() {
  const { toast } = useToast();
  const firedRef = useRef<Set<string>>(new Set());
  const remindersRef = useRef<ScheduledReminder[]>([]);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      if (!res.ok) return;
      const data = await res.json();
      remindersRef.current = data;
    } catch {
      // Will retry next interval
    }
  }, []);

  const disableReminder = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      remindersRef.current = remindersRef.current.map((r) =>
        r.id === id ? { ...r, enabled: false } : r
      );
    } catch {
      // Best effort
    }
  }, []);

  const snoozeReminder = useCallback(async (id: string) => {
    const snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
      remindersRef.current = remindersRef.current.map((r) =>
        r.id === id ? { ...r, snoozedUntil } : r
      );
    } catch {
      // Best effort
    }
  }, []);

  const fireReminder = useCallback(
    (reminder: ScheduledReminder) => {
      const msg = reminder.title + (reminder.message ? ` \u2014 ${reminder.message}` : "");

      toast(msg, "reminder", 30000, [
        { label: "Snooze", onClick: () => snoozeReminder(reminder.id) },
        { label: "Turn off", onClick: () => disableReminder(reminder.id) },
      ]);

      if (reminder.soundEnabled !== false) {
        playChime();
      }

      if (
        reminder.notifyEnabled !== false &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(reminder.title, {
            body: reminder.message ?? undefined,
            tag: reminder.id,
          });
        } catch {
          // Notifications not supported in this context
        }
      }
    },
    [toast, snoozeReminder, disableReminder]
  );

  useEffect(() => {
    fetchReminders();

    const refreshInterval = setInterval(fetchReminders, 5 * 60 * 1000);

    const checkInterval = setInterval(() => {
      const now = new Date();
      for (const reminder of remindersRef.current) {
        if (shouldFire(reminder, now, firedRef.current)) {
          fireReminder(reminder);
        }
      }
    }, 60 * 1000);

    const cleanupInterval = setInterval(() => {
      firedRef.current.clear();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(checkInterval);
      clearInterval(cleanupInterval);
    };
  }, [fetchReminders, fireReminder]);

  return null;
}
