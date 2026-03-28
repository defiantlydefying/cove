"use client";

import { useState, useRef } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";

interface PlannerItemProps {
  item: PlannerItemType;
  onToggleComplete: (id: string) => void;
  onUpdate: (item: { id: string; title?: string; startTime?: string; endTime?: string }) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

export default function PlannerItem({
  item,
  onToggleComplete,
  onUpdate,
  onDelete,
  compact,
  draggable,
  onDragStart,
}: PlannerItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== item.title) {
      onUpdate({ id: item.id, title: trimmed });
    }
    setEditing(false);
  };

  return (
    <div
      className={`group flex items-center gap-2 ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      } rounded-lg border border-cove-border/40 bg-cove-card/80 hover:border-cove-accent/30 transition-colors ${
        item.completed ? "opacity-50" : ""
      }`}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, item.id)}
    >
      {draggable && (
        <span className="cursor-grab text-cove-muted text-xs select-none">
          &#x2807;&#x2807;
        </span>
      )}

      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggleComplete(item.id)}
        className="w-4 h-4 rounded border-cove-border text-cove-accent focus:ring-cove-accent shrink-0"
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full text-sm bg-transparent border-none outline-none text-cove-charcoal"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditTitle(item.title);
              setEditing(true);
            }}
            className={`text-sm text-left w-full truncate ${
              item.completed
                ? "line-through text-cove-muted"
                : "text-cove-charcoal"
            }`}
          >
            {item.title}
          </button>
        )}

        {item.startTime && item.endTime && (
          <p className="text-[10px] text-cove-muted">
            {item.startTime} - {item.endTime}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-red-500 text-xs transition-opacity shrink-0"
        aria-label="Delete item"
      >
        &#x2715;
      </button>
    </div>
  );
}
