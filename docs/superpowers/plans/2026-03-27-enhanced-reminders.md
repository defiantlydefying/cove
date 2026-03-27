# Enhanced Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade reminders from a simple toggle list to a full scheduling system with 12 preset templates, inline settings editing, AI-assisted scheduling, and browser notifications.

**Architecture:** New Prisma fields for scheduling (time, interval, active days). Preset definitions as a shared constant. ReminderForm redesigned with preset picker + AI builder. ReminderItem gains expandable inline settings. A ReminderScheduler client component checks schedules every 60s and fires toasts + browser notifications. Toast system extended with a "reminder" variant that has action buttons.

**Tech Stack:** Next.js 16, React 19, Prisma, Tailwind CSS 4, Web Notifications API, Web Audio API, Gemini AI (existing pattern)

---

## File Structure

### New files:
- `src/lib/reminder-presets.ts` — Preset definitions constant, shared by UI and API
- `src/components/reminders/ReminderPresetPicker.tsx` — Grid of preset cards for quick-add
- `src/components/reminders/ReminderScheduleFields.tsx` — Time picker, interval dropdown, day toggles (reused in form and inline edit)
- `src/components/reminders/ReminderScheduler.tsx` — Client-side scheduler that checks every 60s and fires notifications
- `src/app/api/reminders/schedule-ai/route.ts` — AI endpoint for natural language schedule parsing
- `public/sounds/reminder-chime.mp3` — Gentle notification chime (will synthesize via Web Audio instead)

### Modified files:
- `prisma/schema.prisma` — Add new fields to Reminder model
- `src/components/reminders/ReminderItem.tsx` — Add inline expand with schedule settings
- `src/components/reminders/ReminderForm.tsx` — Add schedule fields to creation flow
- `src/components/reminders/ReminderList.tsx` — Add preset picker, AI builder, redesign layout
- `src/components/providers/ToastProvider.tsx` — Add reminder toast variant with action buttons
- `src/app/api/reminders/route.ts` — Support new fields in POST
- `src/app/api/reminders/[id]/route.ts` — Support new fields in PATCH
- `src/app/dashboard/page.tsx` — Mount ReminderScheduler
- `src/components/daily/DailyView.tsx` — Show schedule info in reminder cards

### Test files:
- `src/components/reminders/ReminderScheduleFields.test.tsx`
- `src/components/reminders/ReminderPresetPicker.test.tsx`
- `src/components/reminders/ReminderList.test.tsx` (update existing)
- `src/components/reminders/ReminderItem.test.tsx` (update existing)
- `src/components/reminders/ReminderForm.test.tsx` (update existing)

---

## Task 1: Database Schema & Migration

**Files:**
- Modify: `prisma/schema.prisma:141-154`

- [ ] **Step 1: Update Reminder model in schema**

In `prisma/schema.prisma`, replace the Reminder model (lines 141-154) with:

```prisma
model Reminder {
  id              String    @id @default(cuid())
  userId          String
  title           String
  message         String?
  type            String    @default("custom")
  schedule        String?
  enabled         Boolean   @default(true)
  snoozedUntil    DateTime?
  scheduledTime   String?
  intervalMinutes Int?
  activeDays      String    @default("0,1,2,3,4,5,6")
  presetKey       String?
  soundEnabled    Boolean   @default(true)
  notifyEnabled   Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Run migration**

Run: `npx prisma migrate dev --name add-reminder-scheduling-fields`
Expected: Migration applied successfully

- [ ] **Step 3: Verify Prisma client regenerated**

Run: `npx prisma generate`
Expected: Prisma Client generated

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add scheduling fields to Reminder model"
```

---

## Task 2: Preset Definitions

**Files:**
- Create: `src/lib/reminder-presets.ts`

- [ ] **Step 1: Create preset definitions file**

```typescript
export interface ReminderPreset {
  key: string;
  title: string;
  description: string;
  defaultTime: string;
  defaultIntervalMinutes: number | null;
  defaultDays: string;
  type: string;
}

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
    key: "sunlight",
    title: "Get Some Sunlight",
    description: "Go outside or sit by a window",
    defaultTime: "10:00",
    defaultIntervalMinutes: null,
    defaultDays: "0,1,2,3,4,5,6",
    type: "self-care",
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
  const weekdays = [1, 2, 3, 4, 5].every((d) => dayIndices.includes(d)) && dayIndices.length === 5;

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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reminder-presets.ts
git commit -m "feat: add reminder preset definitions and schedule utilities"
```

---

## Task 3: Update API Routes

**Files:**
- Modify: `src/app/api/reminders/route.ts`
- Modify: `src/app/api/reminders/[id]/route.ts`

- [ ] **Step 1: Update POST handler to accept new fields**

In `src/app/api/reminders/route.ts`, update the POST handler. After extracting `title`, `message`, `type`, `schedule`, `enabled` from the body, also extract and pass through the new fields:

```typescript
const {
  title, message, type, schedule, enabled,
  scheduledTime, intervalMinutes, activeDays, presetKey,
  soundEnabled, notifyEnabled,
} = await req.json();
```

And in the `prisma.reminder.create` data object, add:

```typescript
scheduledTime: scheduledTime ?? null,
intervalMinutes: intervalMinutes != null ? Number(intervalMinutes) : null,
activeDays: activeDays ?? "0,1,2,3,4,5,6",
presetKey: presetKey ?? null,
soundEnabled: soundEnabled ?? true,
notifyEnabled: notifyEnabled ?? true,
```

- [ ] **Step 2: Update PATCH handler to accept new fields**

In `src/app/api/reminders/[id]/route.ts`, in the PATCH handler's `data` object construction, add after the existing fields:

```typescript
if (scheduledTime !== undefined) data.scheduledTime = scheduledTime;
if (intervalMinutes !== undefined) data.intervalMinutes = intervalMinutes != null ? Number(intervalMinutes) : null;
if (activeDays !== undefined) data.activeDays = activeDays;
if (presetKey !== undefined) data.presetKey = presetKey;
if (soundEnabled !== undefined) data.soundEnabled = soundEnabled;
if (notifyEnabled !== undefined) data.notifyEnabled = notifyEnabled;
```

And extract these fields from the request body alongside existing ones.

- [ ] **Step 3: Verify API still works**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/api/reminders/
git commit -m "feat: support scheduling fields in reminder API routes"
```

---

## Task 4: AI Schedule Endpoint

**Files:**
- Create: `src/app/api/reminders/schedule-ai/route.ts`

- [ ] **Step 1: Create the AI schedule parsing endpoint**

Follow the pattern from `src/app/api/routines/generate/route.ts`. Create `src/app/api/reminders/schedule-ai/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a scheduling assistant for a wellness reminder app. Parse the user's natural language schedule description into structured JSON.

Return ONLY a JSON object with these fields:
- "title": string (a short name for the reminder, if the user described one)
- "scheduledTime": string in "HH:MM" 24-hour format (the start time)
- "intervalMinutes": number or null (null = once per day, otherwise repeat interval in minutes)
- "activeDays": string of comma-separated day indices where 0=Sunday, 1=Monday, ..., 6=Saturday
- "type": one of "custom", "hydration", "break", "medication", "self-care"

Examples:
- "every 2 hours on weekdays starting at 9am" -> {"scheduledTime":"09:00","intervalMinutes":120,"activeDays":"1,2,3,4,5","type":"custom"}
- "daily at 10pm" -> {"scheduledTime":"22:00","intervalMinutes":null,"activeDays":"0,1,2,3,4,5,6","type":"custom"}
- "take meds every morning at 8" -> {"title":"Take Medication","scheduledTime":"08:00","intervalMinutes":null,"activeDays":"0,1,2,3,4,5,6","type":"medication"}`;

const MOCK_RESPONSE = {
  title: "Custom Reminder",
  scheduledTime: "09:00",
  intervalMinutes: null,
  activeDays: "0,1,2,3,4,5,6",
  type: "custom",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json(
      { error: "A schedule description is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(MOCK_RESPONSE);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt.trim());
    const text = result.response.text();

    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    return NextResponse.json({
      title: parsed.title ?? null,
      scheduledTime: parsed.scheduledTime ?? "09:00",
      intervalMinutes: parsed.intervalMinutes ?? null,
      activeDays: parsed.activeDays ?? "0,1,2,3,4,5,6",
      type: parsed.type ?? "custom",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not parse that schedule. Try describing it differently." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reminders/schedule-ai/
git commit -m "feat: add AI schedule parsing endpoint for reminders"
```

---

## Task 5: ReminderScheduleFields Component

**Files:**
- Create: `src/components/reminders/ReminderScheduleFields.tsx`

- [ ] **Step 1: Create the reusable schedule fields component**

This component is used both in the creation form and in inline editing. It renders time picker, interval dropdown, day toggles, and sound/notification toggles.

```typescript
"use client";

import { INTERVAL_OPTIONS, DAY_LABELS } from "@/lib/reminder-presets";

interface ReminderScheduleFieldsProps {
  scheduledTime: string;
  intervalMinutes: number | null;
  activeDays: string;
  soundEnabled: boolean;
  notifyEnabled: boolean;
  onTimeChange: (time: string) => void;
  onIntervalChange: (interval: number | null) => void;
  onDaysChange: (days: string) => void;
  onSoundChange: (enabled: boolean) => void;
  onNotifyChange: (enabled: boolean) => void;
  compact?: boolean;
}

export default function ReminderScheduleFields({
  scheduledTime,
  intervalMinutes,
  activeDays,
  soundEnabled,
  notifyEnabled,
  onTimeChange,
  onIntervalChange,
  onDaysChange,
  onSoundChange,
  onNotifyChange,
  compact = false,
}: ReminderScheduleFieldsProps) {
  const dayIndices = activeDays.split(",").map(Number);

  function toggleDay(dayIndex: number) {
    const current = new Set(dayIndices);
    if (current.has(dayIndex)) {
      current.delete(dayIndex);
    } else {
      current.add(dayIndex);
    }
    if (current.size === 0) return; // Must have at least one day
    const sorted = Array.from(current).sort((a, b) => a - b);
    onDaysChange(sorted.join(","));
  }

  const labelClass = compact
    ? "text-xs text-cove-muted w-14 shrink-0"
    : "text-sm font-medium text-cove-charcoal mb-1 block";

  const inputClass =
    "px-3 py-2 text-sm border border-cove-border rounded-xl bg-cove-offwhite text-cove-charcoal focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-colors";

  return (
    <div className={`flex flex-col ${compact ? "gap-3" : "gap-4"}`}>
      {/* Time */}
      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Time</label>
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className={inputClass}
          aria-label="Reminder time"
        />
      </div>

      {/* Interval */}
      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Repeat</label>
        <select
          value={intervalMinutes ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onIntervalChange(val === "" ? null : Number(val));
          }}
          className={inputClass}
          aria-label="Repeat interval"
        >
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Day toggles */}
      <div className={compact ? "flex items-center gap-2" : ""}>
        <label className={labelClass}>Days</label>
        <div className="flex gap-1" role="group" aria-label="Active days">
          {DAY_LABELS.map((label, index) => {
            const active = dayIndices.includes(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                aria-pressed={active}
                aria-label={
                  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index]
                }
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border hover:border-cove-accent/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound & Notification toggles */}
      <div className={`flex ${compact ? "gap-4" : "gap-6"} items-center`}>
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onSoundChange(e.target.checked)}
            className="accent-cove-accent"
          />
          Sound
        </label>
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={notifyEnabled}
            onChange={(e) => onNotifyChange(e.target.checked)}
            className="accent-cove-accent"
          />
          Browser alerts
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reminders/ReminderScheduleFields.tsx
git commit -m "feat: add ReminderScheduleFields reusable component"
```

---

## Task 6: ReminderPresetPicker Component

**Files:**
- Create: `src/components/reminders/ReminderPresetPicker.tsx`

- [ ] **Step 1: Create preset picker grid**

```typescript
"use client";

import { REMINDER_PRESETS, type ReminderPreset } from "@/lib/reminder-presets";

interface ReminderPresetPickerProps {
  onSelect: (preset: ReminderPreset) => void;
}

const TYPE_COLORS: Record<string, string> = {
  medication: "border-cove-heather/30 bg-cove-heather-light",
  hydration: "border-cove-blue/30 bg-cove-blue-light",
  "self-care": "border-cove-amber/30 bg-cove-amber-light",
  break: "border-cove-accent/30 bg-cove-accent-light",
  custom: "border-cove-border-light bg-cove-sand-light",
};

export default function ReminderPresetPicker({
  onSelect,
}: ReminderPresetPickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {REMINDER_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset)}
          className={`p-3 rounded-xl border text-left hover:shadow-md hover:scale-[1.02] transition-all ${
            TYPE_COLORS[preset.type] ?? TYPE_COLORS.custom
          }`}
        >
          <p className="text-sm font-semibold text-cove-charcoal">
            {preset.title}
          </p>
          <p className="text-xs text-cove-muted mt-0.5">
            {preset.description}
          </p>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reminders/ReminderPresetPicker.tsx
git commit -m "feat: add ReminderPresetPicker grid component"
```

---

## Task 7: Redesign ReminderForm with Schedule Fields + AI

**Files:**
- Modify: `src/components/reminders/ReminderForm.tsx`

- [ ] **Step 1: Rewrite ReminderForm**

Replace the entire contents of `src/components/reminders/ReminderForm.tsx` with a new form that includes schedule fields and AI builder:

```typescript
"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { INTERVAL_OPTIONS } from "@/lib/reminder-presets";
import ReminderScheduleFields from "./ReminderScheduleFields";

const REMINDER_TYPES = ["custom", "hydration", "break", "medication", "self-care"];

export interface ReminderFormData {
  title: string;
  message?: string;
  type: string;
  scheduledTime: string;
  intervalMinutes: number | null;
  activeDays: string;
  presetKey?: string;
  soundEnabled: boolean;
  notifyEnabled: boolean;
}

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => void;
  initialData?: Partial<ReminderFormData>;
}

export default function ReminderForm({ onSubmit, initialData }: ReminderFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [type, setType] = useState(initialData?.type ?? "custom");
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime ?? "09:00");
  const [intervalMinutes, setIntervalMinutes] = useState<number | null>(
    initialData?.intervalMinutes ?? null
  );
  const [activeDays, setActiveDays] = useState(initialData?.activeDays ?? "0,1,2,3,4,5,6");
  const [soundEnabled, setSoundEnabled] = useState(initialData?.soundEnabled ?? true);
  const [notifyEnabled, setNotifyEnabled] = useState(initialData?.notifyEnabled ?? true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      message: message.trim() || undefined,
      type,
      scheduledTime,
      intervalMinutes,
      activeDays,
      presetKey: initialData?.presetKey,
      soundEnabled,
      notifyEnabled,
    });
    if (!initialData) {
      setTitle("");
      setMessage("");
      setType("custom");
      setScheduledTime("09:00");
      setIntervalMinutes(null);
      setActiveDays("0,1,2,3,4,5,6");
      setSoundEnabled(true);
      setNotifyEnabled(true);
    }
  }

  async function handleAiSchedule() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/reminders/schedule-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Something went wrong. Try again.");
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.scheduledTime) setScheduledTime(data.scheduledTime);
      if (data.intervalMinutes !== undefined) setIntervalMinutes(data.intervalMinutes);
      if (data.activeDays) setActiveDays(data.activeDays);
      if (data.type && data.type !== "custom") setType(data.type);
      setAiPrompt("");
      toast("Schedule filled in from your description.", "success");
    } catch {
      setAiError("Could not reach the AI. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const inputClass =
    "border border-cove-border rounded-xl px-3 py-2 text-sm bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-colors";

  return (
    <form onSubmit={handleSubmit} className="bg-cove-card rounded-xl border border-cove-border-light p-5 flex flex-col gap-4">
      {/* Title & Message */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Reminder title"
        aria-label="Reminder title"
        maxLength={150}
        required
        className={inputClass}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message"
        aria-label="Reminder message"
        maxLength={500}
        rows={2}
        className={`${inputClass} resize-none`}
      />

      {/* Type */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Reminder type"
        className={`${inputClass} capitalize`}
      >
        {REMINDER_TYPES.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t}
          </option>
        ))}
      </select>

      {/* Schedule Fields */}
      <div className="border-t border-cove-border-light pt-4">
        <p className="text-sm font-semibold text-cove-charcoal mb-3">Schedule</p>
        <ReminderScheduleFields
          scheduledTime={scheduledTime}
          intervalMinutes={intervalMinutes}
          activeDays={activeDays}
          soundEnabled={soundEnabled}
          notifyEnabled={notifyEnabled}
          onTimeChange={setScheduledTime}
          onIntervalChange={setIntervalMinutes}
          onDaysChange={setActiveDays}
          onSoundChange={setSoundEnabled}
          onNotifyChange={setNotifyEnabled}
        />
      </div>

      {/* AI Schedule Helper */}
      <div className="border-t border-cove-border-light pt-4">
        <p className="text-xs font-medium text-cove-muted mb-2">
          Or describe your schedule in words
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAiSchedule(); } }}
            placeholder="e.g. every 2 hours on weekdays starting at 9am"
            maxLength={300}
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="button"
            onClick={handleAiSchedule}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {aiLoading ? "Parsing..." : "Apply"}
          </button>
        </div>
        {aiError && <p className="text-xs text-red-500 mt-1" role="alert">{aiError}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add reminder
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reminders/ReminderForm.tsx
git commit -m "feat: redesign ReminderForm with schedule fields and AI helper"
```

---

## Task 8: Redesign ReminderItem with Inline Expand

**Files:**
- Modify: `src/components/reminders/ReminderItem.tsx`

- [ ] **Step 1: Rewrite ReminderItem with expandable settings**

Replace the entire contents of `src/components/reminders/ReminderItem.tsx`:

```typescript
"use client";

import { useState } from "react";
import { formatScheduleSummary } from "@/lib/reminder-presets";
import ReminderScheduleFields from "./ReminderScheduleFields";

export interface Reminder {
  id: string;
  title: string;
  message?: string | null;
  type: string;
  schedule?: string | null;
  enabled: boolean;
  snoozedUntil?: string | null;
  scheduledTime?: string | null;
  intervalMinutes?: number | null;
  activeDays?: string;
  presetKey?: string | null;
  soundEnabled?: boolean;
  notifyEnabled?: boolean;
}

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
  onUpdate: (id: string, fields: Partial<Reminder>) => void;
}

const badgeColors: Record<string, string> = {
  hydration: "bg-cove-blue-light text-cove-blue",
  break: "bg-cove-accent-light text-cove-accent",
  medication: "bg-cove-heather-light text-cove-heather",
  "self-care": "bg-cove-amber-light text-cove-amber",
  custom: "bg-cove-sand-light text-cove-muted",
};

export default function ReminderItem({
  reminder,
  onToggle,
  onDelete,
  onSnooze,
  onUpdate,
}: ReminderItemProps) {
  const [expanded, setExpanded] = useState(false);

  const isSnoozed =
    reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date();

  const scheduleSummary = formatScheduleSummary(
    reminder.scheduledTime,
    reminder.intervalMinutes,
    reminder.activeDays
  );

  return (
    <div
      className={`rounded-xl border transition-colors ${
        expanded
          ? "border-cove-accent/30 bg-cove-card shadow-sm"
          : "border-cove-border-light bg-cove-card"
      }`}
      data-testid="reminder-item"
    >
      {/* Collapsed row */}
      <div className="flex items-start gap-3 p-3 group">
        <button
          role="switch"
          aria-checked={reminder.enabled}
          aria-label={`Toggle ${reminder.title}`}
          onClick={() => onToggle(reminder.id, !reminder.enabled)}
          className={`mt-0.5 shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            reminder.enabled ? "bg-cove-accent" : "bg-cove-border"
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
            className={`break-words text-sm ${
              reminder.enabled ? "text-cove-charcoal" : "text-cove-muted"
            }`}
          >
            {reminder.title}
          </span>

          {reminder.scheduledTime && (
            <p className="text-xs text-cove-muted mt-0.5">{scheduleSummary}</p>
          )}

          {reminder.message && (
            <p className="text-xs text-cove-muted mt-0.5 break-words">{reminder.message}</p>
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
              <span className="text-xs text-cove-muted">
                Snoozed until{" "}
                {new Date(reminder.snoozedUntil!).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Close settings" : "Open settings"}
          className={`shrink-0 mt-0.5 p-1 rounded-md transition-colors ${
            expanded
              ? "text-cove-accent"
              : "text-cove-muted hover:text-cove-charcoal"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button
          onClick={() => onSnooze(reminder.id)}
          aria-label={`Snooze ${reminder.title}`}
          className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-cove-charcoal shrink-0 mt-0.5 text-xs transition-opacity"
        >
          Snooze
        </button>

        <button
          onClick={() => onDelete(reminder.id)}
          aria-label={`Delete ${reminder.title}`}
          className="opacity-0 group-hover:opacity-100 text-cove-muted hover:text-cove-charcoal shrink-0 mt-0.5 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="border-t border-cove-border-light px-3 py-3 animate-fade-in-up">
          <ReminderScheduleFields
            compact
            scheduledTime={reminder.scheduledTime ?? "09:00"}
            intervalMinutes={reminder.intervalMinutes ?? null}
            activeDays={reminder.activeDays ?? "0,1,2,3,4,5,6"}
            soundEnabled={reminder.soundEnabled ?? true}
            notifyEnabled={reminder.notifyEnabled ?? true}
            onTimeChange={(v) => onUpdate(reminder.id, { scheduledTime: v })}
            onIntervalChange={(v) => onUpdate(reminder.id, { intervalMinutes: v })}
            onDaysChange={(v) => onUpdate(reminder.id, { activeDays: v })}
            onSoundChange={(v) => onUpdate(reminder.id, { soundEnabled: v })}
            onNotifyChange={(v) => onUpdate(reminder.id, { notifyEnabled: v })}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reminders/ReminderItem.tsx
git commit -m "feat: add inline expandable settings to ReminderItem"
```

---

## Task 9: Redesign ReminderList

**Files:**
- Modify: `src/components/reminders/ReminderList.tsx`

- [ ] **Step 1: Rewrite ReminderList with preset picker, AI builder, and updated handlers**

Replace the entire contents of `src/components/reminders/ReminderList.tsx`. Key changes: import ReminderPresetPicker, add `handleUpdate` for inline settings changes, pass `onUpdate` to ReminderItem, add preset picker and AI section at top, add header message about toggling. The full file is large so here are the key structural changes:

- Add import for `ReminderPresetPicker` and `ReminderFormData` from new form
- Add import for `ReminderPreset` from presets
- Add `handleUpdate` function that does optimistic PATCH for schedule field changes
- Add `handlePresetSelect` that pre-fills and shows the form
- Update `handleCreate` to accept `ReminderFormData` (with schedule fields)
- Update POST body in `handleCreate` to include all new fields
- Render: header message, then preset picker + AI builder section (similar to RoutineList layout), then form when active, then reminder list, then empty state
- Pass `onUpdate={handleUpdate}` to each `ReminderItem`

- [ ] **Step 2: Commit**

```bash
git add src/components/reminders/ReminderList.tsx
git commit -m "feat: redesign ReminderList with presets, AI builder, and inline editing"
```

---

## Task 10: Extend Toast System for Reminder Notifications

**Files:**
- Modify: `src/components/providers/ToastProvider.tsx`

- [ ] **Step 1: Add reminder toast variant**

Add a new toast type `"reminder"` with action buttons. Update the `ToastType` to include `"reminder"`. Add optional `actions` to the Toast interface. Reminder toasts auto-dismiss after 30 seconds (not 3.5s) and show "Snooze", "Dismiss", and "Turn off" buttons.

Key changes to `ToastProvider.tsx`:
- `ToastType = "success" | "error" | "info" | "reminder"`
- Add `actions?: { label: string; onClick: () => void }[]` to Toast interface
- Add `duration?: number` parameter to the toast function
- Reminder toasts render action buttons below the message
- Reminder toasts use `bg-cove-sidebar text-cove-sidebar-text` styling (dark, prominent)

- [ ] **Step 2: Commit**

```bash
git add src/components/providers/ToastProvider.tsx
git commit -m "feat: add reminder toast variant with action buttons"
```

---

## Task 11: ReminderScheduler Component

**Files:**
- Create: `src/components/reminders/ReminderScheduler.tsx`

- [ ] **Step 1: Create the client-side scheduler**

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface ScheduledReminder {
  id: string;
  title: string;
  message?: string | null;
  enabled: boolean;
  scheduledTime?: string | null;
  intervalMinutes?: number | null;
  activeDays?: string;
  soundEnabled?: boolean;
  notifyEnabled?: boolean;
  snoozedUntil?: string | null;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 587; // D5
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

function shouldFire(
  reminder: ScheduledReminder,
  now: Date,
  firedSet: Set<string>
): boolean {
  if (!reminder.enabled || !reminder.scheduledTime) return false;

  // Check snoozed
  if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) return false;

  // Check active day
  const dayIndex = now.getDay();
  const activeDays = (reminder.activeDays ?? "0,1,2,3,4,5,6").split(",").map(Number);
  if (!activeDays.includes(dayIndex)) return false;

  const [schedH, schedM] = reminder.scheduledTime.split(":").map(Number);
  const nowH = now.getHours();
  const nowM = now.getMinutes();

  if (reminder.intervalMinutes) {
    // Interval-based: check if current time is on an interval boundary from start time
    const startMinutes = schedH * 60 + schedM;
    const nowMinutes = nowH * 60 + nowM;
    if (nowMinutes < startMinutes) return false;
    const elapsed = nowMinutes - startMinutes;
    if (elapsed % reminder.intervalMinutes !== 0) return false;
  } else {
    // Once-daily: check exact time match
    if (nowH !== schedH || nowM !== schedM) return false;
  }

  // Deduplicate within this minute
  const fireKey = `${reminder.id}-${nowH}:${nowM}`;
  if (firedSet.has(fireKey)) return false;
  firedSet.add(fireKey);
  return true;
}

export default function ReminderScheduler() {
  const { toast } = useToast();
  const firedRef = useRef<Set<string>>(new Set());
  const remindersRef = useRef<ScheduledReminder[]>([]);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      if (!res.ok) return;
      const data = await res.json();
      remindersRef.current = data;
    } catch {
      // Silently fail — will retry next interval
    }
  }, []);

  const disableReminder = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      remindersRef.current = remindersRef.current.map((r) =>
        r.id === id ? { ...r, enabled: false } : r
      );
    } catch {
      // Best effort
    }
  }, []);

  const snoozeReminder = useCallback(async (id: string) => {
    const snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snoozedUntil }),
      });
      remindersRef.current = remindersRef.current.map((r) =>
        r.id === id ? { ...r, snoozedUntil } : r
      );
    } catch {
      // Best effort
    }
  }, []);

  const fireReminder = useCallback(
    (reminder: ScheduledReminder) => {
      // In-app toast with actions
      toast(reminder.title + (reminder.message ? ` — ${reminder.message}` : ""), "reminder", 30000, [
        { label: "Snooze", onClick: () => snoozeReminder(reminder.id) },
        { label: "Turn off", onClick: () => disableReminder(reminder.id) },
      ]);

      // Sound
      if (reminder.soundEnabled !== false) {
        playChime();
      }

      // Browser notification
      if (reminder.notifyEnabled !== false && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(reminder.title, {
            body: reminder.message ?? undefined,
            tag: reminder.id,
          });
        } catch {
          // Notifications not supported in this context
        }
      }
    },
    [toast, snoozeReminder, disableReminder]
  );

  useEffect(() => {
    fetchReminders();

    // Refresh reminder data every 5 minutes
    const refreshInterval = setInterval(fetchReminders, 5 * 60 * 1000);

    // Check every 60 seconds
    const checkInterval = setInterval(() => {
      const now = new Date();
      for (const reminder of remindersRef.current) {
        if (shouldFire(reminder, now, firedRef.current)) {
          fireReminder(reminder);
        }
      }
    }, 60 * 1000);

    // Clean up old fired keys every hour
    const cleanupInterval = setInterval(() => {
      firedRef.current.clear();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(checkInterval);
      clearInterval(cleanupInterval);
    };
  }, [fetchReminders, fireReminder]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      // Don't request immediately — wait for user to create a reminder with notifications
      // The permission request happens in the form
    }
  }, []);

  return null; // No visual output — purely a scheduling engine
}
```

- [ ] **Step 2: Mount in dashboard page**

In `src/app/dashboard/page.tsx`, import and render `ReminderScheduler` inside the `AppShell` return, before the tab content div:

```typescript
import ReminderScheduler from "@/components/reminders/ReminderScheduler";
```

And add `<ReminderScheduler />` right after the opening `<AppShell ...>` tag, before the `<div key={activeTab}>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/reminders/ReminderScheduler.tsx src/app/dashboard/page.tsx
git commit -m "feat: add client-side ReminderScheduler with browser notifications"
```

---

## Task 12: Update ToastProvider for Reminder Toasts

**Files:**
- Modify: `src/components/providers/ToastProvider.tsx`

- [ ] **Step 1: Extend toast system**

Update `ToastProvider.tsx` to support reminder-style toasts with action buttons and custom duration:

- Change `ToastType` to `"success" | "error" | "info" | "reminder"`
- Add `actions` and `duration` to Toast interface
- Update the `toast` function signature to accept optional duration and actions
- Render action buttons for reminder toasts
- Style reminder toasts with `bg-cove-sidebar text-cove-sidebar-text`

The toast function becomes:
```typescript
const toast = useCallback(
  (message: string, type: ToastType = "info", duration?: number, actions?: { label: string; onClick: () => void }[]) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, actions }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration ?? TOAST_DURATION);
  },
  []
);
```

Reminder toast rendering adds action buttons:
```tsx
{t.actions && t.actions.length > 0 && (
  <div className="flex gap-2 mt-2">
    {t.actions.map((action, i) => (
      <button
        key={i}
        onClick={() => { action.onClick(); setToasts((prev) => prev.filter((x) => x.id !== t.id)); }}
        className="text-xs px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
      >
        {action.label}
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 2: Update ToastContextValue interface**

```typescript
interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number, actions?: { label: string; onClick: () => void }[]) => void;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/providers/ToastProvider.tsx
git commit -m "feat: extend toast system with reminder variant and action buttons"
```

---

## Task 13: Update Existing Tests

**Files:**
- Modify: `src/components/reminders/ReminderList.test.tsx`
- Modify: `src/components/reminders/ReminderItem.test.tsx`
- Modify: `src/components/reminders/ReminderForm.test.tsx`

- [ ] **Step 1: Update ReminderItem tests**

The Reminder interface now has additional optional fields. Update mock data to include them. Update tests to check for schedule summary rendering. Add test for expand/collapse of settings panel.

- [ ] **Step 2: Update ReminderForm tests**

The form now has schedule fields. Update tests to check for time input, interval select, and day toggles rendering.

- [ ] **Step 3: Update ReminderList tests**

Update to check for preset picker rendering. Update mock fetch responses to include new fields. Check that the header message about toggling is displayed.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/reminders/
git commit -m "test: update reminder tests for scheduling features"
```

---

## Task 14: Update DailyView Reminder Cards

**Files:**
- Modify: `src/components/daily/DailyView.tsx`

- [ ] **Step 1: Show schedule summary in daily reminder cards**

Import `formatScheduleSummary` from `@/lib/reminder-presets`. In the reminders section where each reminder is rendered, add the schedule summary below the title:

```tsx
{reminder.scheduledTime && (
  <p className="text-xs text-cove-muted">
    {formatScheduleSummary(reminder.scheduledTime, reminder.intervalMinutes, reminder.activeDays)}
  </p>
)}
```

Add `scheduledTime`, `intervalMinutes`, and `activeDays` to the `DailyReminder` interface.

- [ ] **Step 2: Commit**

```bash
git add src/components/daily/DailyView.tsx
git commit -m "feat: show reminder schedule info in daily view"
```

---

## Task 15: Final Build Verification

- [ ] **Step 1: Run build**

Run: `npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 3: Final commit if any loose changes**

```bash
git status
# If any uncommitted changes:
git add -A && git commit -m "chore: final cleanup for enhanced reminders"
```
