"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - itemDay.getTime()) / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (diffDays === 0) return time;
  if (diffDays === 1) return `Yesterday ${time}`;
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString([], { weekday: "short" });
    return `${dayName} ${time}`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`;
}

export interface InboxItemData {
  id: string;
  content: string;
  source: string;
  status: string;
  convertedTo: string | null;
  createdAt: string;
}

interface InboxListProps {
  items: InboxItemData[];
  onConvert: (id: string, to: "task" | "reminder") => void;
  onDismiss: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}

function InboxItem({
  item,
  onConvert,
  onDismiss,
  onUpdate,
}: {
  item: InboxItemData;
  onConvert: (id: string, to: "task" | "reminder") => void;
  onDismiss: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.content) {
      onUpdate?.(item.id, trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setEditValue(item.content);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-cove-card border border-cove-accent/10">
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={save}
              rows={2}
              className="w-full text-sm text-cove-charcoal bg-cove-offwhite border border-cove-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cove-accent resize-none"
            />
          </div>
        ) : (
          <p
            className="text-sm text-cove-charcoal leading-snug cursor-pointer hover:text-cove-accent transition-colors"
            onClick={() => {
              if (onUpdate) {
                setEditValue(item.content);
                setEditing(true);
              }
            }}
            title="Click to edit"
          >
            {item.content}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          {item.source === "voice" && (
            <span className="text-[10px] text-cove-muted bg-cove-accent/5 px-1.5 py-0.5 rounded">
              voice
            </span>
          )}
          <span className="text-[10px] text-cove-muted">
            {formatRelativeDate(item.createdAt)}
          </span>
        </div>
      </div>
      {!editing && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onConvert(item.id, "task")}
            className="text-[10px] px-2 py-1 rounded-lg bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20 transition-colors"
            title="Convert to task"
          >
            Task
          </button>
          <button
            onClick={() => onConvert(item.id, "reminder")}
            className="text-[10px] px-2 py-1 rounded-lg bg-cove-blue/10 text-cove-blue hover:bg-cove-blue/20 transition-colors"
            title="Convert to reminder"
          >
            Reminder
          </button>
          <button
            onClick={() => onDismiss(item.id)}
            className="text-[10px] px-2 py-1 rounded-lg text-cove-muted hover:bg-cove-muted/10 transition-colors"
            title="Dismiss"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default function InboxList({ items, onConvert, onDismiss, onUpdate }: InboxListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-cove-muted uppercase tracking-wider px-1">
        Inbox ({items.length})
      </p>
      {items.map((item) => (
        <InboxItem
          key={item.id}
          item={item}
          onConvert={onConvert}
          onDismiss={onDismiss}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
