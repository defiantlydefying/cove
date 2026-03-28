"use client";

export const DAY_START_HOUR = 6;
export const PIXELS_PER_MINUTE = 1;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface TimeBlockProps {
  item: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    completed: boolean;
  };
  onToggleComplete: (id: string) => void;
  onClick: (id: string) => void;
  color?: string;
}

export default function TimeBlock({
  item,
  onToggleComplete,
  onClick,
  color = "bg-cove-accent",
}: TimeBlockProps) {
  const startMin = timeToMinutes(item.startTime) - DAY_START_HOUR * 60;
  const endMin = timeToMinutes(item.endTime) - DAY_START_HOUR * 60;
  const duration = Math.max(endMin - startMin, 15);
  const top = Math.max(startMin * PIXELS_PER_MINUTE, 0);
  const height = Math.max(duration * PIXELS_PER_MINUTE, 20);

  return (
    <div
      className={`absolute left-12 right-1 rounded-lg ${color} text-white text-xs px-2 py-1 cursor-pointer overflow-hidden transition-opacity ${
        item.completed ? "opacity-40 line-through" : "hover:opacity-90"
      }`}
      style={{ top: `${top}px`, height: `${height}px` }}
      onClick={() => onClick(item.id)}
    >
      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete(item.id);
          }}
          className="w-3 h-3 rounded border-white/50 shrink-0"
        />
        <span className="font-medium truncate">{item.title}</span>
      </div>
      {height > 30 && (
        <p className="text-[10px] opacity-80 mt-0.5">
          {item.startTime} - {item.endTime}
        </p>
      )}
    </div>
  );
}
