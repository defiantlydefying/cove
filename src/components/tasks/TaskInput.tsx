"use client";

import { useState, KeyboardEvent } from "react";

interface TaskInputProps {
  onAdd: (title: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Add a task..."
      maxLength={200}
      className="w-full px-3 py-2.5 text-sm border border-white/15 rounded-lg bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-colors"
    />
  );
}
