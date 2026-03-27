"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { type ReminderPreset } from "@/lib/reminder-presets";
import ReminderForm, { type ReminderFormData } from "./ReminderForm";
import ReminderItem, { type Reminder } from "./ReminderItem";
import ReminderPresetPicker from "./ReminderPresetPicker";

export default function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<ReminderFormData> | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchReminders() {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/reminders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReminders(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReminders();
  }, []);

  async function handleCreate(data: ReminderFormData) {
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setReminders((prev) => [...prev, created]);
      setShowForm(false);
      setFormInitialData(undefined);
      toast("Reminder created.", "success");
    } catch {
      toast("Couldn\u2019t create reminder. Try again.", "error");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled } : r))
    );

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r))
      );
      toast("Couldn\u2019t update reminder. Try again.", "error");
    }
  }

  async function handleUpdate(id: string, fields: Partial<Reminder>) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields } : r))
    );

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
    } catch {
      await fetchReminders();
      toast("Couldn\u2019t save changes. Try again.", "error");
    }
  }

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const prev = reminders;
    setReminders((curr) => curr.filter((r) => r.id !== id));

    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Reminder deleted.", "success");
    } catch {
      setReminders(prev);
      toast("Couldn\u2019t delete reminder. Try again.", "error");
    }
  }

  async function handleSnooze(id: string) {
    const snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, snoozedUntil } : r))
    );

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
      if (!res.ok) throw new Error();
      toast("Snoozed for 30 minutes.", "success");
    } catch {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, snoozedUntil: null } : r))
      );
      toast("Couldn\u2019t snooze reminder. Try again.", "error");
    }
  }

  function handlePresetSelect(preset: ReminderPreset) {
    setFormInitialData({
      title: preset.title,
      type: preset.type,
      scheduledTime: preset.defaultTime,
      intervalMinutes: preset.defaultIntervalMinutes,
      activeDays: preset.defaultDays,
      presetKey: preset.key,
      soundEnabled: true,
      notifyEnabled: true,
    });
    setShowForm(true);
  }

  function handleNewCustom() {
    setFormInitialData(undefined);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Reminders</h2>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-cove-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Reminders</h2>
        <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
          <p className="text-cove-muted">Couldn&apos;t load reminders.</p>
          <button
            onClick={fetchReminders}
            className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Reminders</h2>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setFormInitialData(undefined);
            } else {
              handleNewCustom();
            }
          }}
          className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          {showForm ? "Cancel" : "+ Custom reminder"}
        </button>
      </div>

      <p className="text-xs text-cove-muted -mt-4">
        Toggle any reminder on or off — they are here to help, not to overwhelm.
      </p>

      {/* Preset picker + form */}
      {!showForm && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-cove-charcoal">Quick add from presets</p>
          <ReminderPresetPicker onSelect={handlePresetSelect} />
        </div>
      )}

      {showForm && (
        <div className="animate-fade-in-up">
          <ReminderForm onSubmit={handleCreate} initialData={formInitialData} />
        </div>
      )}

      {/* Reminder list */}
      {reminders.length > 0 && (
        <div className="flex flex-col gap-2">
          {reminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggle={handleToggle}
              onDelete={handleDeleteRequest}
              onSnooze={handleSnooze}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {reminders.length === 0 && !showForm && (
        <div className="text-center py-6 px-4 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-sm font-medium text-cove-charcoal mb-2">Gentle nudges when you need them</p>
          <p className="text-xs text-cove-muted leading-relaxed max-w-sm mx-auto">
            Pick a preset above or create a custom reminder. You can adjust the schedule, sound, and notification settings for each one.
          </p>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-cove-charcoal flex-1">Delete this reminder?</p>
          <button
            onClick={handleDeleteConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cove-border text-cove-charcoal hover:bg-cove-border/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
