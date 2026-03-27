"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import ReminderScheduleFields from "./ReminderScheduleFields";

const REMINDER_TYPES = ["custom", "hydration", "break", "medication", "self-care"];

export interface ReminderFormData {
  title: string;
  message?: string;
  type: string;
  scheduledTime: string;
  intervalMinutes: number | null;
  activeDays: string;
  presetKey?: string;
  soundEnabled: boolean;
  notifyEnabled: boolean;
}

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => void;
  initialData?: Partial<ReminderFormData>;
}

export default function ReminderForm({ onSubmit, initialData }: ReminderFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [type, setType] = useState(initialData?.type ?? "custom");
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime ?? "09:00");
  const [intervalMinutes, setIntervalMinutes] = useState<number | null>(
    initialData?.intervalMinutes ?? null
  );
  const [activeDays, setActiveDays] = useState(initialData?.activeDays ?? "0,1,2,3,4,5,6");
  const [soundEnabled, setSoundEnabled] = useState(initialData?.soundEnabled ?? true);
  const [notifyEnabled, setNotifyEnabled] = useState(initialData?.notifyEnabled ?? true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      message: message.trim() || undefined,
      type,
      scheduledTime,
      intervalMinutes,
      activeDays,
      presetKey: initialData?.presetKey,
      soundEnabled,
      notifyEnabled,
    });
    if (!initialData) {
      setTitle("");
      setMessage("");
      setType("custom");
      setScheduledTime("09:00");
      setIntervalMinutes(null);
      setActiveDays("0,1,2,3,4,5,6");
      setSoundEnabled(true);
      setNotifyEnabled(true);
    }
  }

  async function handleAiSchedule() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/reminders/schedule-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Something went wrong. Try again.");
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.scheduledTime) setScheduledTime(data.scheduledTime);
      if (data.intervalMinutes !== undefined) setIntervalMinutes(data.intervalMinutes);
      if (data.activeDays) setActiveDays(data.activeDays);
      if (data.type && data.type !== "custom") setType(data.type);
      setAiPrompt("");
      toast("Schedule filled in from your description.", "success");
    } catch {
      setAiError("Could not reach the AI. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const inputClass =
    "border border-cove-border rounded-xl px-3 py-2 text-sm bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-colors";

  return (
    <form onSubmit={handleSubmit} className="bg-cove-card rounded-xl border border-cove-border-light p-5 flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Reminder title"
        aria-label="Reminder title"
        maxLength={150}
        required
        className={inputClass}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message"
        aria-label="Reminder message"
        maxLength={500}
        rows={2}
        className={`${inputClass} resize-none`}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Reminder type"
        className={`${inputClass} capitalize`}
      >
        {REMINDER_TYPES.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t}
          </option>
        ))}
      </select>

      <div className="border-t border-cove-border-light pt-4">
        <p className="text-sm font-semibold text-cove-charcoal mb-3">Schedule</p>
        <ReminderScheduleFields
          scheduledTime={scheduledTime}
          intervalMinutes={intervalMinutes}
          activeDays={activeDays}
          soundEnabled={soundEnabled}
          notifyEnabled={notifyEnabled}
          onTimeChange={setScheduledTime}
          onIntervalChange={setIntervalMinutes}
          onDaysChange={setActiveDays}
          onSoundChange={setSoundEnabled}
          onNotifyChange={setNotifyEnabled}
        />
      </div>

      <div className="border-t border-cove-border-light pt-4">
        <p className="text-xs font-medium text-cove-muted mb-2">
          Or describe your schedule in words
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAiSchedule(); } }}
            placeholder="e.g. every 2 hours on weekdays starting at 9am"
            maxLength={300}
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="button"
            onClick={handleAiSchedule}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {aiLoading ? "Parsing..." : "Apply"}
          </button>
        </div>
        {aiError && <p className="text-xs text-red-500 mt-1" role="alert">{aiError}</p>}
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add reminder
      </button>
    </form>
  );
}
