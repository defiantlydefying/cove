export interface ReminderPreset {
  key: string;
  title: string;
  description: string;
  defaultTime: string;
  defaultIntervalMinutes: number | null;
  defaultDays: string;
  type: string;
}

// Ordered for visual grouping in a 3-column grid.
// Each row of 3 shares a color and a theme:
// Row 1 (heather): Health essentials — medication, water, eat
// Row 2 (amber): Body care — shower, sunlight, bedtime
// Row 3 (sage): Movement & calm — stretch, break, breathe
// Row 4 (teal): Awareness & connection — body check-in, tidy, connect
export const REMINDER_PRESETS: ReminderPreset[] = [
  {
    key: "medication",
    title: "Take Medication",
    description: "Daily medication reminder",
    defaultTime: "09:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "medication",
  },
  {
    key: "water",
    title: "Drink Water",
    description: "Stay hydrated throughout the day",
    defaultTime: "08:00",
    defaultIntervalMinutes: 120,
    defaultDays: "0,1,2,3,4,5,6",
    type: "hydration",
  },
  {
    key: "eat",
    title: "Eat a Meal",
    description: "Remember to fuel your body",
    defaultTime: "12:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "shower",
    title: "Shower / Hygiene",
    description: "Gentle hygiene reminder",
    defaultTime: "08:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "sunlight",
    title: "Get Some Sunlight",
    description: "Go outside or sit by a window",
    defaultTime: "10:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "bedtime",
    title: "Start Winding Down",
    description: "Begin your bedtime routine",
    defaultTime: "22:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "stretch",
    title: "Stretch / Move",
    description: "Get up and move your body",
    defaultTime: "10:00",
    defaultIntervalMinutes: 120,
    defaultDays: "1,2,3,4,5",
    type: "break",
  },
  {
    key: "break",
    title: "Take a Break",
    description: "Step away from the screen",
    defaultTime: "10:00",
    defaultIntervalMinutes: 90,
    defaultDays: "1,2,3,4,5",
    type: "break",
  },
  {
    key: "breathe",
    title: "Breathing Exercise",
    description: "Take a minute to breathe deeply",
    defaultTime: "12:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "checkin",
    title: "Body Check-in",
    description: "Notice how your body feels",
    defaultTime: "14:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
  {
    key: "tidy",
    title: "5-Minute Tidy",
    description: "Quick space reset to reduce clutter",
    defaultTime: "17:00",
    defaultIntervalMinutes: null,
    defaultDays: "1,2,3,4,5",
    type: "self-care",
  },
  {
    key: "connect",
    title: "Reach Out to Someone",
    description: "Text a friend or call family",
    defaultTime: "18:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
  },
];

export const INTERVAL_OPTIONS = [
  { label: "Once a day", value: null },
  { label: "Every 30 minutes", value: 30 },
  { label: "Every hour", value: 60 },
  { label: "Every 90 minutes", value: 90 },
  { label: "Every 2 hours", value: 120 },
  { label: "Every 3 hours", value: 180 },
  { label: "Every 4 hours", value: 240 },
] as const;

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function formatScheduleSummary(
  scheduledTime: string | null | undefined,
  intervalMinutes: number | null | undefined,
  activeDays: string | undefined
): string {
  if (!scheduledTime) return "No schedule set";

  const [h, m] = scheduledTime.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

  const days = activeDays ?? "0,1,2,3,4,5,6";
  const dayIndices = days.split(",").map(Number);
  const allDays = dayIndices.length === 7;
  const weekdays =
    [1, 2, 3, 4, 5].every((d) => dayIndices.includes(d)) &&
    dayIndices.length === 5;

  let dayStr = "";
  if (allDays) dayStr = "";
  else if (weekdays) dayStr = ", weekdays";
  else {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayStr = ", " + dayIndices.map((d) => names[d]).join("/");
  }

  if (intervalMinutes) {
    const intervalStr =
      intervalMinutes < 60
        ? `Every ${intervalMinutes}m`
        : intervalMinutes === 60
        ? "Every hour"
        : `Every ${intervalMinutes / 60}h`;
    return `${intervalStr} from ${timeStr}${dayStr}`;
  }

  return `Daily at ${timeStr}${dayStr}`;
}
