"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";
import PlannerItem from "./PlannerItem";
import EventEditor from "./EventEditor";

const ZONES = [
  { key: "must", label: "Must Do", bg: "bg-cove-accent/8", border: "border-cove-accent/15", text: "text-cove-accent", headerBg: "bg-cove-accent/15" },
  { key: "should", label: "Should Do", bg: "bg-amber-50", border: "border-amber-200/50", text: "text-amber-700", headerBg: "bg-amber-100/50" },
  { key: "could", label: "Could Do", bg: "bg-purple-50", border: "border-purple-200/50", text: "text-purple-700", headerBg: "bg-purple-100/50" },
];

const VISIBLE_HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 48;
const START_HOUR = 6;

function pad(n: number) { return String(n).padStart(2, "0"); }
function minToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; }
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function formatTimeLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface WeekDay {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

interface PlannerPriorityViewProps {
  items: PlannerItemType[];
  weekDays: WeekDay[];
  onToggleComplete: (id: string) => void;
  onUpdate: (item: { id: string } & Partial<PlannerItemType>) => void;
  onDelete: (id: string) => void;
  onAdd: (item: { title: string; date?: string; zone?: string; startTime?: string; endTime?: string }) => void;
  onReorder: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => void;
}

const BLOCK_COLORS: Record<string, string> = {
  must: "bg-cove-accent",
  should: "bg-amber-500",
  could: "bg-purple-500",
};

export default function PlannerPriorityView({
  items,
  weekDays,
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

  // Current time line
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Event editor state
  const [editor, setEditor] = useState<{
    mode: "create" | "edit";
    itemId?: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    zone: string;
    position: { top: number; left: number };
  } | null>(null);

  // Click on grid cell
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>, dayDate: string) => {
    if (editor) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-event-block]") || target.closest("[data-event-editor]")) return;

    const col = target.closest("[data-day-col]");
    if (!col) return;
    const rect = col.getBoundingClientRect();
    const scrollTop = gridRef.current?.scrollTop ?? 0;
    const y = e.clientY - rect.top + scrollTop;
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60) + START_HOUR * 60;
    const snapped = Math.round(totalMin / 30) * 30;

    setEditor({
      mode: "create",
      title: "",
      date: dayDate,
      startTime: minToTime(snapped),
      endTime: minToTime(snapped + 60),
      zone: "must",
      position: { top: e.clientY - 100, left: Math.min(e.clientX, window.innerWidth - 320) },
    });
  }, [editor]);

  // Click existing block
  const handleBlockClick = useCallback((e: React.MouseEvent, item: PlannerItemType) => {
    e.stopPropagation();
    const itemDate = typeof item.date === "string" ? item.date.split("T")[0] : new Date(item.date).toISOString().split("T")[0];
    setEditor({
      mode: "edit",
      itemId: item.id,
      title: item.title,
      date: itemDate,
      startTime: item.startTime!,
      endTime: item.endTime!,
      zone: item.zone,
      position: { top: e.clientY - 100, left: Math.min(e.clientX, window.innerWidth - 320) },
    });
  }, []);

  // Save from editor
  const handleEditorSave = useCallback((data: { id?: string; title: string; date?: string; startTime: string; endTime: string; zone: string }) => {
    if (editor?.mode === "edit" && data.id) {
      onUpdate({ id: data.id, title: data.title, date: data.date, startTime: data.startTime, endTime: data.endTime, zone: data.zone });
    } else {
      onAdd({ title: data.title, date: data.date, startTime: data.startTime, endTime: data.endTime, zone: data.zone });
    }
    setEditor(null);
  }, [editor, onUpdate, onAdd]);

  const handleEditorDelete = useCallback(() => {
    if (editor?.itemId) onDelete(editor.itemId);
    setEditor(null);
  }, [editor, onDelete]);

  // Zone add
  const handleZoneAdd = (zone: string) => {
    const title = newItems[zone]?.trim();
    if (!title) return;
    onAdd({ title, zone, date: todayStr });
    setNewItems((prev) => ({ ...prev, [zone]: "" }));
    setShowZoneAdd((prev) => ({ ...prev, [zone]: false }));
  };

  const handleZoneDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    const itemId = dragItem.current;
    if (!itemId) return;
    const item = items.find((i) => i.id === itemId);
    if (!item || item.zone === zone) { dragItem.current = null; return; }
    const zoneItems = items.filter((i) => i.zone === zone && !i.startTime);
    onReorder([{ id: itemId, sortOrder: zoneItems.length, zone }]);
    dragItem.current = null;
  };

  const getItemsForDay = (date: string) => {
    return items.filter((i) => {
      const d = typeof i.date === "string" ? i.date.split("T")[0] : new Date(i.date).toISOString().split("T")[0];
      return d === date;
    });
  };

  const untimedItems = items.filter((i) => !i.startTime || !i.endTime);

  const editorWeekDays = weekDays.map((d) => ({
    date: d.date,
    label: `${d.dayName.slice(0, 2)} ${d.dayNum}`,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Week time grid */}
      <div className="border border-cove-border rounded-xl bg-cove-card overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-cove-border/50" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          <div className="border-r border-cove-border/30" />
          {weekDays.map((day) => (
            <div
              key={day.date}
              className={`flex flex-col items-center py-2.5 border-r border-cove-border/30 last:border-r-0 ${
                day.isToday ? "bg-cove-accent/5" : ""
              }`}
            >
              <span className={`text-[10px] font-medium ${day.isToday ? "text-cove-accent" : "text-cove-muted"}`}>
                {day.dayName}
              </span>
              <span
                className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                  day.isToday ? "bg-cove-accent text-white" : "text-cove-charcoal"
                }`}
              >
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>

        {/* All-day row */}
        <div className="grid border-b border-cove-border/50" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          <div className="flex items-start justify-center pt-1.5 border-r border-cove-border/30">
            <span className="text-[9px] text-cove-muted">All day</span>
          </div>
          {weekDays.map((day) => {
            const dayUntimed = getItemsForDay(day.date).filter((i) => !i.startTime);
            return (
              <div
                key={day.date}
                className={`min-h-[36px] px-1 py-1 border-r border-cove-border/30 last:border-r-0 flex flex-wrap gap-0.5 ${
                  day.isToday ? "bg-cove-accent/3" : ""
                }`}
              >
                {dayUntimed.map((item) => (
                  <div
                    key={item.id}
                    className={`text-[9px] px-1.5 py-0.5 rounded-md truncate max-w-full cursor-pointer ${
                      BLOCK_COLORS[item.zone] || "bg-cove-accent"
                    } text-white ${item.completed ? "opacity-40 line-through" : ""}`}
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(item.id); }}
                    title={item.title}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={gridRef} className="relative overflow-y-auto cursor-pointer" style={{ height: "420px" }}>
          <div className="relative" style={{ height: `${VISIBLE_HOURS.length * HOUR_HEIGHT}px` }}>
            {/* Hour rows */}
            {VISIBLE_HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-cove-border/20"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                <span className="absolute left-1 -top-[7px] text-[9px] text-cove-muted bg-cove-card px-0.5 select-none w-11 text-right">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}

            {/* Day columns */}
            <div
              className="absolute top-0 bottom-0 grid"
              style={{ left: "48px", right: 0, gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {weekDays.map((day) => {
                const dayTimed = getItemsForDay(day.date).filter((i) => i.startTime && i.endTime);
                return (
                  <div
                    key={day.date}
                    data-day-col
                    className={`relative border-r border-cove-border/15 last:border-r-0 ${
                      day.isToday ? "bg-cove-accent/3" : ""
                    }`}
                    onClick={(e) => handleGridClick(e, day.date)}
                  >
                    {dayTimed.map((item) => {
                      const startMin = timeToMin(item.startTime!) - START_HOUR * 60;
                      const endMin = timeToMin(item.endTime!) - START_HOUR * 60;
                      const dur = Math.max(endMin - startMin, 15);
                      const top = Math.max(startMin * (HOUR_HEIGHT / 60), 0);
                      const height = Math.max(dur * (HOUR_HEIGHT / 60), 20);

                      return (
                        <div
                          key={item.id}
                          data-event-block
                          className={`absolute left-0.5 right-0.5 rounded-md ${
                            BLOCK_COLORS[item.zone] || "bg-cove-accent"
                          } text-white text-[10px] px-1.5 py-1 cursor-pointer overflow-hidden transition-opacity ${
                            item.completed ? "opacity-30 line-through" : "hover:opacity-90"
                          }`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => handleBlockClick(e, item)}
                        >
                          <span className="font-medium truncate block leading-tight">{item.title}</span>
                          {height > 30 && (
                            <span className="text-[8px] opacity-80 leading-tight">
                              {formatTimeLabel(item.startTime!)}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Current time indicator */}
                    {day.isToday && nowMin >= START_HOUR * 60 && nowMin <= (START_HOUR + VISIBLE_HOURS.length) * 60 && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none"
                        style={{ top: `${(nowMin - START_HOUR * 60) * (HOUR_HEIGHT / 60)}px` }}
                      >
                        <div className="relative flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                          <div className="flex-1 h-px bg-red-500" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-cove-muted text-center -mt-2">
        Click the calendar to add a time block, or add items to the zones below
      </p>

      {/* Priority zones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ZONES.map((zone) => {
          const zoneItems = untimedItems.filter((i) => i.zone === zone.key);
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
                      aria-label={`Add item to ${zone.label}`}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 p-2 flex-1">
                {zoneItems.map((item) => (
                  <PlannerItem
                    key={item.id}
                    item={item}
                    onToggleComplete={() => onToggleComplete(item.id)}
                    onUpdate={onUpdate}
                    onDelete={() => onDelete(item.id)}
                    compact
                    draggable
                    onDragStart={() => { dragItem.current = item.id; }}
                  />
                ))}

                {isAdding && (
                  <div className="flex gap-1.5">
                    <input
                      value={newItems[zone.key] || ""}
                      onChange={(e) => setNewItems((prev) => ({ ...prev, [zone.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleZoneAdd(zone.key);
                        if (e.key === "Escape") setShowZoneAdd((prev) => ({ ...prev, [zone.key]: false }));
                      }}
                      placeholder="New item..."
                      autoFocus
                      className="flex-1 px-2 py-1.5 text-xs bg-cove-card border border-cove-border rounded-lg text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:border-cove-accent"
                    />
                    <button
                      onClick={() => handleZoneAdd(zone.key)}
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${zone.text} border ${zone.border} hover:bg-cove-card/60 transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event editor overlay */}
      {editor && (
        <div className="fixed inset-0 z-50" onClick={() => setEditor(null)}>
          <div onClick={(e) => e.stopPropagation()} data-event-editor>
            <EventEditor
              initial={{
                id: editor.itemId,
                title: editor.title,
                date: editor.date,
                startTime: editor.startTime,
                endTime: editor.endTime,
                zone: editor.zone,
              }}
              position={editor.position}
              weekDays={editorWeekDays}
              onSave={handleEditorSave}
              onDelete={editor.mode === "edit" ? handleEditorDelete : undefined}
              onCancel={() => setEditor(null)}
              isEditing={editor.mode === "edit"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
