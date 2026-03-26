"use client";

import { useEffect, useState } from "react";
import ReminderForm from "./ReminderForm";
import ReminderItem, { Reminder } from "./ReminderItem";

export default function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => {
        setReminders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(data: {
    title: string;
    message?: string;
    type: string;
  }) {
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setReminders((prev) => [...prev, created]);
      setShowForm(false);
    } catch {
      // ignore
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled } : r))
    );

    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r))
      );
    }
  }

  async function handleDelete(id: string) {
    const prev = reminders;
    setReminders((curr) => curr.filter((r) => r.id !== id));

    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    } catch {
      setReminders(prev);
    }
  }

  async function handleSnooze(id: string) {
    const snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, snoozedUntil } : r))
    );

    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
    } catch {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, snoozedUntil: null } : r))
      );
    }
  }

  if (loading) {
    return <p className="text-sm text-cove-muted">Loading reminders...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-sm text-cove-charcoal">Reminders</p>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="text-sm text-indigo-500 hover:text-indigo-600 self-start"
      >
        {showForm ? "Cancel" : "+ New reminder"}
      </button>

      {showForm && <ReminderForm onSubmit={handleCreate} />}

      <div className="flex flex-col divide-y">
        {reminders.map((reminder) => (
          <ReminderItem
            key={reminder.id}
            reminder={reminder}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onSnooze={handleSnooze}
          />
        ))}
      </div>

      {reminders.length === 0 && (
        <p className="text-xs text-cove-muted">No reminders yet.</p>
      )}
    </div>
  );
}
