"use client";

interface InboxItemData {
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
}

export default function InboxList({ items, onConvert, onDismiss }: InboxListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-cove-muted uppercase tracking-wider px-1">
        Inbox ({items.length})
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2 p-3 rounded-xl bg-cove-card border border-cove-accent/10"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-cove-charcoal leading-snug">{item.content}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {item.source === "voice" && (
                <span className="text-[10px] text-cove-muted bg-cove-accent/5 px-1.5 py-0.5 rounded">
                  voice
                </span>
              )}
              <span className="text-[10px] text-cove-muted">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
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
        </div>
      ))}
    </div>
  );
}
