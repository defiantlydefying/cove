"use client";

import { useState, useRef } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";
import PlannerItem from "./PlannerItem";

const ZONES = [
  { key: "must", label: "Must Do", bg: "bg-cove-accent/8", border: "border-cove-accent/15", text: "text-cove-accent", headerBg: "bg-cove-accent/15" },
  { key: "should", label: "Should Do", bg: "bg-amber-900/5", border: "border-amber-700/15", text: "text-amber-800", headerBg: "bg-amber-800/10" },
  { key: "could", label: "Could Do", bg: "bg-purple-900/5", border: "border-purple-700/15", text: "text-purple-800", headerBg: "bg-purple-800/10" },
];

const VISIBLE_HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 48;

interface PlannerPriorityViewProps {
  items: PlannerItemType[];
  onToggleComplete: (id: string) => void;
  onUpdate: (item: { id: string } & Partial<PlannerItemType>) => void;
  onDelete: (id: string) => void;
  onAdd: (item: { title: string; zone?: string; startTime?: string; endTime?: string }) => void;
  onReorder: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => void;
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function minToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; }
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

export default function PlannerPriorityView({
  items,
  onToggleComplete,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
}: PlannerPriorityViewProps) {
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [showZoneAdd, setShowZoneAdd] = useState<Record<string, boolean>>({});
  const dragItem = useRef<string | null>(null);

  // Event creation on calendar grid
  const [newEvent, setNewEvent] = useState<{ startTime: string; endTime: string } | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");

  const timedItems = items.filter((i) => i.startTime && i.endTime);
  const untimedItems = items.filter((i) => !i.startTime || !i.endTime);

  const handleDrop = (e: React.DragEvent, zone: string) => {
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

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (newEvent) return; // already creating
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60) + 6 * 60;
    // Snap to nearest 30 min
    const snapped = Math.round(totalMin / 30) * 30;
    const startTime = minToTime(snapped);
    const endTime = minToTime(snapped + 60);
    setNewEvent({ startTime, endTime });
    setNewEventTitle("");
  };

  const handleCreateEvent = () => {
    const title = newEventTitle.trim();
    if (!title || !newEvent) return;
    onAdd({ title, zone: "must", startTime: newEvent.startTime, endTime: newEvent.endTime });
    setNewEvent(null);
    setNewEventTitle("");
  };

  const cancelEvent = () => {
    setNewEvent(null);
    setNewEventTitle("");
  };

  const timeBlockColors = ["bg-cove-accent", "bg-amber-600", "bg-purple-600"];

  return (
    <div className="flex flex-col gap-3">
      {/* Google Calendar-style time grid */}
      <div
        className="relative border border-cove-border rounded-xl bg-cove-card overflow-y-auto cursor-pointer"
        style={{ height: "360px" }}
        onClick={handleGridClick}
      >
        {/* Hour rows */}
        {VISIBLE_HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-cove-border/20"
            style={{ top: `${(hour - 6) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
          >
            <span className="absolute left-2 -top-[7px] text-[10px] text-cove-muted bg-cove-card px-0.5 select-none">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </span>
          </div>
        ))}

        {/* Existing time blocks */}
        {timedItems.map((item, i) => {
          const startMin = timeToMin(item.startTime!) - 6 * 60;
          const endMin = timeToMin(item.endTime!) - 6 * 60;
          const dur = Math.max(endMin - startMin, 15);
          const top = Math.max(startMin * (HOUR_HEIGHT / 60), 0);
          const height = Math.max(dur * (HOUR_HEIGHT / 60), 20);

          return (
            <div
              key={item.id}
              className={`absolute left-12 right-2 rounded-md ${timeBlockColors[i % timeBlockColors.length]} text-white text-xs px-2 py-1 cursor-pointer overflow-hidden ${
                item.completed ? "opacity-40 line-through" : "hover:opacity-90"
              }`}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={(e) => { e.stopPropagation(); onToggleComplete(item.id); }}
            >
              <span className="font-medium truncate block">{item.title}</span>
              {height > 28 && (
                <span className="text-[10px] opacity-80">
                  {item.startTime} - {item.endTime}
                </span>
              )}
            </div>
          );
        })}

        {/* New event preview */}
        {newEvent && (() => {
          const startMin = timeToMin(newEvent.startTime) - 6 * 60;
          const dur = timeToMin(newEvent.endTime) - timeToMin(newEvent.startTime);
          const top = startMin * (HOUR_HEIGHT / 60);
          const height = dur * (HOUR_HEIGHT / 60);
          return (
            <div
              className="absolute left-12 right-2 rounded-md bg-cove-accent/20 border-2 border-dashed border-cove-accent text-xs px-2 py-1"
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateEvent();
                  if (e.key === "Escape") cancelEvent();
                }}
                placeholder="Event name..."
                autoFocus
                className="w-full bg-transparent border-none outline-none text-cove-charcoal text-xs font-medium placeholder:text-cove-muted"
              />
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-cove-muted">
                  {newEvent.startTime} - {newEvent.endTime}
                </span>
                <div className="flex-1" />
                <button onClick={cancelEvent} className="text-[10px] text-cove-muted hover:text-red-500">Cancel</button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEventTitle.trim()}
                  className="text-[10px] font-medium text-cove-accent hover:underline disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          );
        })()}

        <div style={{ height: `${VISIBLE_HOURS.length * HOUR_HEIGHT}px` }} />
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-cove-muted text-center -mt-1">
        Click on the timeline to add a timed event
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
              onDrop={(e) => handleDrop(e, zone.key)}
            >
              {/* Zone header */}
              <div className={`flex items-center justify-between px-3 py-2 ${zone.headerBg}`}>
                <h4 className={`text-xs font-semibold ${zone.text}`}>
                  {zone.label}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-cove-muted">{zoneItems.length}</span>
                  {!isAdding && (
                    <button
                      onClick={() => setShowZoneAdd((prev) => ({ ...prev, [zone.key]: true }))}
                      className={`text-sm leading-none ${zone.text} opacity-60 hover:opacity-100`}
                      title="Add item"
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
