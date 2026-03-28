"use client";

import { useState, useRef } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";
import PlannerItem from "./PlannerItem";

interface PlannerListViewProps {
  items: PlannerItemType[];
  onToggleComplete: (id: string) => void;
  onUpdate: (item: { id: string } & Partial<PlannerItemType>) => void;
  onDelete: (id: string) => void;
  onAdd: (item: { title: string; zone: string }) => void;
  onReorder: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => void;
}

export default function PlannerListView({
  items,
  onToggleComplete,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
}: PlannerListViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragEnd = () => {
    const fromId = dragItem.current;
    const toId = dragOverItem.current;
    if (!fromId || !toId || fromId === toId) return;

    const fromIdx = sorted.findIndex((i) => i.id === fromId);
    const toIdx = sorted.findIndex((i) => i.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    onReorder(
      reordered.map((item, idx) => ({
        id: item.id,
        sortOrder: idx,
      }))
    );

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    onAdd({ title, zone: "must" });
    setNewTitle("");
  };

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((item) => (
        <div
          key={item.id}
          onDragOver={(e) => {
            e.preventDefault();
            dragOverItem.current = item.id;
          }}
          onDragEnd={handleDragEnd}
        >
          <PlannerItem
            item={item}
            onToggleComplete={onToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
            draggable
            onDragStart={(e, id) => {
              dragItem.current = id;
              e.dataTransfer.effectAllowed = "move";
            }}
          />
        </div>
      ))}

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        placeholder="Add item..."
        className="w-full px-3 py-2 text-sm bg-white border border-dashed border-cove-border rounded-lg focus:border-cove-accent focus:outline-none text-cove-charcoal placeholder:text-cove-muted"
      />
    </div>
  );
}
