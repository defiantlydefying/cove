"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PlannerItem as PlannerItemType } from "./ProductivityContext";
import PlannerItem from "./PlannerItem";
import EventEditor from "./EventEditor";

const ZONES = [
  { key: "must", label: "Must Do", color: "#C4795B", bg: "bg-[#C4795B]/5", border: "border-[#C4795B]/20", text: "text-[#C4795B]", dot: "bg-[#C4795B]" },
  { key: "should", label: "Should Do", color: "#C4A055", bg: "bg-[#C4A055]/5", border: "border-[#C4A055]/20", text: "text-[#C4A055]", dot: "bg-[#C4A055]" },
  { key: "could", label: "Could Do", color: "#7EAAA0", bg: "bg-[#7EAAA0]/5", border: "border-[#7EAAA0]/20", text: "text-[#7EAAA0]", dot: "bg-[#7EAAA0]" },
];

const PRIORITY_TO_ZONE: Record<string, string> = {
  high: "must",
  medium: "should",
  low: "could",
};

const VISIBLE_HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 56;
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
  onAdd: (item: { title: string; date?: string; zone?: string; startTime?: string; endTime?: string; linkedTaskId?: string }) => void;
  onReorder: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => void;
}

const BLOCK_COLORS: Record<string, { bg: string; border: string }> = {
  must: { bg: "bg-[#C4795B]", border: "border-[#C4795B]" },
  should: { bg: "bg-[#C4A055]", border: "border-[#C4A055]" },
  could: { bg: "bg-[#7EAAA0]", border: "border-[#7EAAA0]" },
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
  const pendingLinkedTaskId = useRef<string | null>(null);

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
      position: { top: e.clientY - 100, left: Math.min(e.clientX, window.innerWidth - 440) },
    });
  }, [editor]);

  const handleTaskDrop = useCallback((e: React.DragEvent, dayDate: string) => {
    e.preventDefault();
    const taskData = e.dataTransfer.getData("application/cove-task");
    if (!taskData) return;
    const task = JSON.parse(taskData) as { id: string; title: string; priority: string };
    const col = (e.target as HTMLElement).closest("[data-day-col]");
    if (!col) return;
    const rect = col.getBoundingClientRect();
    const scrollTop = gridRef.current?.scrollTop ?? 0;
    const y = e.clientY - rect.top + scrollTop;
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60) + START_HOUR * 60;
    const snapped = Math.round(totalMin / 30) * 30;
    const zone = PRIORITY_TO_ZONE[task.priority] || "must";

    pendingLinkedTaskId.current = task.id;
    setEditor({
      mode: "create",
      title: task.title,
      date: dayDate,
      startTime: minToTime(snapped),
      endTime: minToTime(snapped + 30),
      zone,
      position: { top: e.clientY - 100, left: Math.min(e.clientX, window.innerWidth - 440) },
    });
  }, []);

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
      position: { top: e.clientY - 100, left: Math.min(e.clientX, window.innerWidth - 440) },
    });
  }, []);

  const handleEditorSave = useCallback((data: { id?: string; title: string; date?: string; startTime: string; endTime: string; zone: string }) => {
    if (editor?.mode === "edit" && data.id) {
      onUpdate({ id: data.id, title: data.title, date: data.date, startTime: data.startTime, endTime: data.endTime, zone: data.zone });
    } else {
      const linkedTaskId = pendingLinkedTaskId.current ?? undefined;
      onAdd({ title: data.title, date: data.date, startTime: data.startTime, endTime: data.endTime, zone: data.zone, linkedTaskId });
    }
    pendingLinkedTaskId.current = null;
    setEditor(null);
  }, [editor, onUpdate, onAdd]);

  const handleEditorDelete = useCallback(() => {
    if (editor?.itemId) onDelete(editor.itemId);
    setEditor(null);
  }, [editor, onDelete]);

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
      <div className="rounded-xl bg-white overflow-hidden border border-[#DADCE0]">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div />
          {weekDays.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center py-2.5"
            >
              <span className={`text-[11px] font-medium tracking-wide uppercase ${day.isToday ? "text-cove-accent" : "text-[#70757a]"}`}>
                {day.dayName}
              </span>
              <span
                className={`text-[26px] font-normal mt-0.5 w-11 h-11 flex items-center justify-center rounded-full ${
                  day.isToday ? "bg-cove-accent text-white" : "text-[#3c4043]"
                }`}
              >
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-[#DADCE0]" />

        {/* All-day row */}
        <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="flex items-center justify-center">
            <span className="text-[10px] text-[#70757a]">All day</span>
          </div>
          {weekDays.map((day) => {
            const dayUntimed = getItemsForDay(day.date).filter((i) => !i.startTime);
            return (
              <div
                key={day.date}
                className={`min-h-[28px] px-0.5 py-0.5 flex flex-wrap gap-0.5 border-l border-[#DADCE0] ${
                  day.isToday ? "bg-cove-accent/[0.03]" : ""
                }`}
              >
                {dayUntimed.map((item) => {
                  const colors = BLOCK_COLORS[item.zone] || BLOCK_COLORS.must;
                  return (
                    <div
                      key={item.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate max-w-full cursor-pointer ${colors.bg} text-white ${item.completed ? "opacity-40 line-through" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onToggleComplete(item.id); }}
                      title={item.title}
                    >
                      {item.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="h-px bg-[#DADCE0]" />

        {/* Time grid */}
        <div ref={gridRef} className="relative overflow-y-auto cursor-pointer" style={{ height: "520px" }}>
          <div className="relative" style={{ height: `${VISIBLE_HOURS.length * HOUR_HEIGHT}px` }}>
            {/* Hour lines */}
            {VISIBLE_HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-[#DADCE0]"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                <span className="absolute left-1.5 -top-[8px] text-[10px] text-[#70757a] select-none font-normal">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}

            {/* Day columns */}
            <div
              className="absolute top-0 bottom-0 grid"
              style={{ left: "56px", right: 0, gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {weekDays.map((day) => {
                const dayTimed = getItemsForDay(day.date).filter((i) => i.startTime && i.endTime);
                return (
                  <div
                    key={day.date}
                    data-day-col
                    className={`relative border-l border-[#DADCE0] ${
                      day.isToday ? "bg-cove-accent/[0.02]" : ""
                    }`}
                    onClick={(e) => handleGridClick(e, day.date)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      if (e.dataTransfer.types.includes("application/cove-task")) {
                        handleTaskDrop(e, day.date);
                      }
                    }}
                  >
                    {dayTimed.map((item) => {
                      const startMin = timeToMin(item.startTime!) - START_HOUR * 60;
                      const endMin = timeToMin(item.endTime!) - START_HOUR * 60;
                      const dur = Math.max(endMin - startMin, 15);
                      const top = Math.max(startMin * (HOUR_HEIGHT / 60), 0);
                      const height = Math.max(dur * (HOUR_HEIGHT / 60), 20);
                      const colors = BLOCK_COLORS[item.zone] || BLOCK_COLORS.must;

                      return (
                        <div
                          key={item.id}
                          data-event-block
                          className={`absolute left-0.5 right-0.5 rounded-md ${colors.bg} text-white text-[11px] px-2 py-1 cursor-pointer overflow-hidden border-l-0 transition-opacity ${
                            item.completed ? "opacity-30 line-through" : "hover:opacity-90"
                          }`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => handleBlockClick(e, item)}
                        >
                          <span className="font-medium truncate block leading-snug">
                            {item.linkedTaskId && <span className="inline-block mr-0.5 text-[9px] opacity-80" title="Linked to task">&#x2713;</span>}
                            {item.title}
                          </span>
                          {height > 34 && (
                            <span className="text-[10px] opacity-80 leading-snug">
                              {formatTimeLabel(item.startTime!)} – {formatTimeLabel(item.endTime!)}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Preview block while editor is open */}
                    {editor && editor.date === day.date && editor.startTime && editor.endTime && (() => {
                      const previewStartMin = timeToMin(editor.startTime) - START_HOUR * 60;
                      const previewEndMin = timeToMin(editor.endTime) - START_HOUR * 60;
                      const previewDur = Math.max(previewEndMin - previewStartMin, 15);
                      const previewTop = Math.max(previewStartMin * (HOUR_HEIGHT / 60), 0);
                      const previewHeight = Math.max(previewDur * (HOUR_HEIGHT / 60), 20);
                      const previewColors = BLOCK_COLORS[editor.zone] || BLOCK_COLORS.must;
                      return (
                        <div
                          className={`absolute left-0.5 right-0.5 rounded-md ${previewColors.bg} text-white text-[11px] px-2 py-1 pointer-events-none overflow-hidden`}
                          style={{ top: `${previewTop}px`, height: `${previewHeight}px` }}
                        >
                          <span className="font-medium truncate block leading-snug">
                            {editor.title || "(No title)"}
                          </span>
                          {previewHeight > 34 && (
                            <span className="text-[10px] opacity-80 leading-snug">
                              {formatTimeLabel(editor.startTime)} – {formatTimeLabel(editor.endTime)}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Current time indicator */}
                    {day.isToday && nowMin >= START_HOUR * 60 && nowMin <= (START_HOUR + VISIBLE_HOURS.length) * 60 && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none"
                        style={{ top: `${(nowMin - START_HOUR * 60) * (HOUR_HEIGHT / 60)}px` }}
                      >
                        <div className="relative flex items-center">
                          <div className="w-3 h-3 rounded-full bg-[#EA4335] -ml-[6px]" />
                          <div className="flex-1 h-[2px] bg-[#EA4335]" />
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

      <p className="text-[11px] text-[#70757a] text-center">
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
              className="flex flex-col rounded-lg bg-white border border-[#DADCE0] min-h-[100px] overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleZoneDrop(e, zone.key)}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#e8eaed]">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${zone.dot}`} />
                  <h4 className="text-xs font-medium text-[#3c4043]">{zone.label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#70757a]">{zoneItems.length}</span>
                  {!isAdding && (
                    <button
                      onClick={() => setShowZoneAdd((prev) => ({ ...prev, [zone.key]: true }))}
                      className="w-6 h-6 flex items-center justify-center text-sm rounded-md text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
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
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#DADCE0] rounded-md text-[#3c4043] placeholder:text-[#80868b] focus:outline-none focus:border-cove-accent transition-colors"
                    />
                    <button
                      onClick={() => handleZoneAdd(zone.key)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
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
              onChange={(data) => setEditor((prev) => prev ? { ...prev, ...data } : prev)}
              isEditing={editor.mode === "edit"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
