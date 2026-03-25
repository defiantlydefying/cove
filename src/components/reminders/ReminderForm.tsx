"use client";

import { useState } from "react";

const REMINDER_TYPES = ["custom", "hydration", "break", "medication", "self-care"];

interface ReminderFormProps {
  onSubmit: (data: { title: string; message?: string; type: string }) => void;
}

export default function ReminderForm({ onSubmit }: ReminderFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("custom");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      message: message.trim() || undefined,
      type,
    });
    setTitle("");
    setMessage("");
    setType("custom");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Reminder title"
        aria-label="Reminder title"
        className="border rounded px-2 py-1 text-sm"
        required
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message"
        aria-label="Reminder message"
        className="border rounded px-2 py-1 text-sm"
        rows={2}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Reminder type"
        className="border rounded px-2 py-1 text-sm"
      >
        {REMINDER_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-indigo-500 text-white rounded px-3 py-1 text-sm hover:bg-indigo-600"
      >
        Add reminder
      </button>
    </form>
  );
}
