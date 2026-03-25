"use client";

export interface Reminder {
  id: string;
  title: string;
  message?: string | null;
  type: string;
  schedule?: string | null;
  enabled: boolean;
  snoozedUntil?: string | null;
}

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
}

const badgeColors: Record<string, string> = {
  hydration: "bg-blue-50 text-blue-600",
  break: "bg-green-50 text-green-600",
  medication: "bg-purple-50 text-purple-600",
  "self-care": "bg-pink-50 text-pink-600",
  custom: "bg-gray-100 text-gray-500",
};

export default function ReminderItem({
  reminder,
  onToggle,
  onDelete,
  onSnooze,
}: ReminderItemProps) {
  const isSnoozed =
    reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date();

  return (
    <div
      className="flex items-start gap-3 py-3 group"
      data-testid="reminder-item"
    >
      <button
        role="switch"
        aria-checked={reminder.enabled}
        aria-label={`Toggle ${reminder.title}`}
        onClick={() => onToggle(reminder.id, !reminder.enabled)}
        className={`mt-0.5 shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          reminder.enabled ? "bg-indigo-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            reminder.enabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={
            reminder.enabled ? "text-gray-900" : "text-gray-400"
          }
        >
          {reminder.title}
        </span>

        {reminder.message && (
          <p className="text-xs text-gray-500 mt-0.5">{reminder.message}</p>
        )}

        <div className="flex flex-wrap gap-1 mt-1">
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              badgeColors[reminder.type] ?? badgeColors.custom
            }`}
            data-testid="type-badge"
          >
            {reminder.type}
          </span>

          {isSnoozed && (
            <span className="text-xs text-gray-400">
              Snoozed until{" "}
              {new Date(reminder.snoozedUntil!).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onSnooze(reminder.id)}
        aria-label={`Snooze ${reminder.title}`}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 text-xs"
      >
        Snooze
      </button>

      <button
        onClick={() => onDelete(reminder.id)}
        aria-label={`Delete ${reminder.title}`}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
