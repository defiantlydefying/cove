"use client";

import { useState, useRef, useCallback } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";
import PlannerItem from "./PlannerItem";
import EventEditor from "./EventEditor";

const ZONES = [
  { key: "must", label: "Must Do", bg: "bg-cove-accent/8", border: "border-cove-accent/15", text: "text-cove-accent", headerBg: "bg-cove-accent/15" },
  { key: "should", label: "Should Do", bg: "bg-amber-900/5", border: "border-amber-700/15", text: "text-amber-800", headerBg: "bg-amber-800/10" },
  { key: "could", label: "Could Do", bg: "bg-purple-900/5", border: "border-purple-700/15", text: "text-purple-800", headerBg: "bg-purple-800/10" },
];

const VISIBLE_HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 48;
const START_HOUR = 6;

function pad(n: number) { return String(n).padStart(2, "0"); }
function minToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; }
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

interface PlannerPriorityViewProps {
  items: PlannerItemType[];
  onToggleComplete: (id: string) => void;
  onUpdate: (item: { id: string } & Partial<PlannerItemType>) => void;
  onDelete: (id: string) => void;
  onAdd: (item: { title: string; zone?: string; startTime?: string; endTime?: string }) => void;
  onReorder: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => void;
}

export default function PlannerPriorityView({
  items,
  onToggleComplete,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
}: PlannerPriorityViewProps) {
  const [showZoneAdd, setShowZoneAdd] = useState<Record<string, boolean>>({});
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const dragItem = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Event editor state
  const [editor, setEditor] = useState<{
    mode: "create" | "edit";
    itemId?: string;
    title: string;
    startTime: string;
    endTime: string;
    zone: string;
    position: { top: number; left: number };
  } | null>(null);

  const timedItems = items.filter((i) => i.startTime && i.endTime);
  const untimedItems = items.filter((i) => !i.startTime || !i.endTime);

  // Click on grid → open editor to create
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (editor) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-event-block]") || target.closest("[data-event-editor]")) return;

    const rect = gridRef.current!.getBoundingClientRect();
    const scrollTop = gridRef.current!.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60) + START_HOUR * 60;
    const snapped = Math.round(totalMin / 30) * 30;

    setEditor({
      mode: "create",
      title: "",
      startTime: minToTime(snapped),
      endTime: minToTime(snapped + 60),
      zone: "must",
      position: { top: Math.min(y, (VISIBLE_HOURS.length * HOUR_HEIGHT) - 300), left: 50 },
    });
  }, [editor]);

  // Click existing block → open editor to edit
  const handleBlockClick = useCallback((e: React.MouseEvent, item: PlannerItemType) => {
    e.stopPropagation();
    const rect = gridRef.current!.getBoundingClientRect();
    const scrollTop = gridRef.current!.scrollTop;
    const y = e.clientY - rect.top + scrollTop;

    setEditor({
      mode: "edit",
      itemId: item.id,
      title: item.title,
      startTime: item.startTime!,
      endTime: item.endTime!,
      zone: item.zone,
      position: { top: Math.min(y, (VISIBLE_HOURS.length * HOUR_HEIGHT) - 300), left: 50 },
    });
  }, []);

  // Save from editor
  const handleEditorSave = useCallback((data: { id?: string; title: string; startTime: string; endTime: string; zone: string }) => {
    if (editor?.mode === "edit" && data.id) {
      onUpdate({ id: data.id, title: data.title, startTime: data.startTime, endTime: data.endTime, zone: data.zone });
    } else {
      onAdd({ title: data.title, startTime: data.startTime, endTime: data.endTime, zone: data.zone });
    }
    setEditor(null);
  }, [editor, onUpdate, onAdd]);

  const handleEditorDelete = useCallback(() => {
    if (editor?.itemId) {
      onDelete(editor.itemId);
    }
    setEditor(null);
  }, [editor, onDelete]);

  // Drop zone item onto calendar grid
  const handleGridDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemId = dragItem.current;
    if (!itemId) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const rect = gridRef.current!.getBoundingClientRect();
    const scrollTop = gridRef.current!.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60) + START_HOUR * 60;
    const snapped = Math.round(totalMin / 30) * 30;

    // Open editor pre-filled with item data
    setEditor({
      mode: "edit",
      itemId: item.id,
      title: item.title,
      startTime: minToTime(snapped),
      endTime: minToTime(snapped + 60),
      zone: item.zone,
      position: { top: Math.min(y, (VISIBLE_HOURS.length * HOUR_HEIGHT) - 300), left: 50 },
    });
    dragItem.current = null;
  }, [items]);

  // Drop between zone columns
  const handleZoneDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    const itemId = dragItem.current;
    if (!itemId) return;
    const item = items.find((i) => i.id === itemId);
    if (!item || item.zone === zone) return;
    const zoneItems = untimedItems.filter((i) => i.zone === zone);
    onReorder([{ id: itemId, sortOrder: zoneItems.length, zone }]);
    dragItem.current = null;
  };

  const handleAddItem = (zone: string) => {
    const title = (newItems[zone] || "").trim();
    if (!title) return;
    onAdd({ title, zone });
    setNewItems((prev) => ({ ...prev, [zone]: "" }));
    setShowZoneAdd((prev) => ({ ...prev, [zone]: false }));
  };

  const timeBlockColors = ["bg-cove-accent", "bg-amber-600", "bg-purple-600"];

  return (
    <div className="flex flex-col gap-3">
      {/* Time grid */}
      <div
        ref={gridRef}
        className="relative border border-cove-border rounded-xl bg-cove-card overflow-y-auto cursor-pointer"
        style={{ height: "360px" }}
        onClick={handleGridClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleGridDrop}
      >
        {/* Hour rows */}
        {VISIBLE_HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-cove-border/20"
            style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
          >
            <span className="absolute left-2 -top-[7px] text-[10px] text-cove-muted bg-cove-card px-0.5 select-none">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </span>
          </div>
        ))}

        {/* Time blocks */}
        {timedItems.map((item, i) => {
          const startMin = timeToMin(item.startTime!) - START_HOUR * 60;
          const endMin = timeToMin(item.endTime!) - START_HOUR * 60;
          const dur = Math.max(endMin - startMin, 15);
          const top = Math.max(startMin * (HOUR_HEIGHT / 60), 0);
          const height = Math.max(dur * (HOUR_HEIGHT / 60), 20);

          return (
            <div
              key={item.id}
              data-event-block
              className={`absolute left-12 right-2 rounded-md ${timeBlockColors[i % timeBlockColors.length]} text-white text-xs px-2.5 py-1.5 cursor-pointer overflow-hidden transition-opacity ${
                item.completed ? "opacity-40 line-through" : "hover:opacity-90"
              }`}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={(e) => handleBlockClick(e, item)}
            >
              <span className="font-medium truncate block">{item.title}</span>
              {height > 28 && (
                <span className="text-[10px] opacity-80">
                  {formatTimeLabel(item.startTime!)} - {formatTimeLabel(item.endTime!)}
                </span>
              )}
            </div>
          );
        })}

        {/* Event editor popover */}
        {editor && (
          <div data-event-editor>
            <EventEditor
              initial={{
                id: editor.itemId,
                title: editor.title,
                startTime: editor.startTime,
                endTime: editor.endTime,
                zone: editor.zone,
              }}
              position={editor.position}
              onSave={handleEditorSave}
              onDelete={editor.mode === "edit" ? handleEditorDelete : undefined}
              onCancel={() => setEditor(null)}
              isEditing={editor.mode === "edit"}
            />
          </div>
        )}

        <div style={{ height: `${VISIBLE_HOURS.length * HOUR_HEIGHT}px` }} />
      </div>

      <p className="text-[10px] text-cove-muted text-center -mt-1">
        Click the timeline to add an event, or drag items from the zones below
      </p>

      {/* Zone columns */}
      <div className="grid grid-cols-3 gap-2">
        {ZONES.map((zone) => {
          const zoneItems = untimedItems
            .filter((i) => i.zone === zone.key)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          const isAdding = showZoneAdd[zone.key];

          return (
            <div
              key={zone.key}
              className={`flex flex-col rounded-xl border ${zone.border} ${zone.bg} min-h-[100px] overflow-hidden`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleZoneDrop(e, zone.key)}
            >
              <div className={`flex items-center justify-between px-3 py-2 ${zone.headerBg}`}>
                <h4 className={`text-xs font-semibold ${zone.text}`}>{zone.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cove-muted">{zoneItems.length}</span>
                  {!isAdding && (
                    <button
                      onClick={() => setShowZoneAdd((prev) => ({ ...prev, [zone.key]: true }))}
                      className={`w-6 h-6 flex items-center justify-center text-base font-medium rounded-md ${zone.text} border border-current/20 hover:bg-cove-card/40 transition-colors`}
                      title="Add item"
                      aria-label={`Add item to ${zone.label}`}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-2">
                {zoneItems.map((item) => (
                  <PlannerItem
                    key={item.id}
                    item={item}
                    onToggleComplete={onToggleComplete}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    compact
                    draggable
                    onDragStart={(e, id) => {
                      dragItem.current = id;
                      e.dataTransfer.effectAllowed = "move";
                    }}
                  />
                ))}

                {isAdding && (
                  <div className="flex flex-col gap-1 p-1.5 bg-cove-card/60 rounded-lg border border-cove-border/30">
                    <input
                      type="text"
                      value={newItems[zone.key] || ""}
                      onChange={(e) => setNewItems((prev) => ({ ...prev, [zone.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddItem(zone.key);
                        if (e.key === "Escape") setShowZoneAdd((prev) => ({ ...prev, [zone.key]: false }));
                      }}
                      placeholder="Item name..."
                      autoFocus
                      className="w-full px-2 py-1 text-xs bg-transparent border-none outline-none text-cove-charcoal placeholder:text-cove-muted"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setShowZoneAdd((prev) => ({ ...prev, [zone.key]: false }))}
                        className="px-2 py-0.5 text-[10px] text-cove-muted hover:text-cove-charcoal"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddItem(zone.key)}
                        disabled={!(newItems[zone.key] || "").trim()}
                        className="px-2 py-0.5 text-[10px] font-medium text-cove-accent hover:underline disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}
