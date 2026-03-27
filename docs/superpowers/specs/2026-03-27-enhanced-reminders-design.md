# Enhanced Reminders Module — Design Spec

## Overview

Upgrade the Reminders module from a simple toggle-based reminder list to a full scheduling system with preset templates, inline settings editing, AI-assisted scheduling, and browser notifications.

## Decisions Made

- **Notification approach**: Both in-app toasts AND browser Notifications API (option C)
- **Scheduling complexity**: Time + interval + day-of-week toggles (option B), with AI natural language as escape hatch for complex schedules
- **Edit UX**: Inline expand on click (option A) — no modals, no popovers
- **Presets**: All 12 selected (medication, water, eat, shower, bedtime, stretch, break, sunlight, breathe, body check-in, tidy, connect)
- **No emojis** in the implementation — use colored type badges instead
- **Every notification must have a "Turn off" control** — make it clear users can block/enable any reminder freely

## 1. Data Model Changes

### Prisma Schema Updates to `Reminder`

Add fields:
```
scheduledTime    String?          // "09:00" (24h format)
intervalMinutes  Int?             // null = once/day, else repeat interval
activeDays       String  @default("0,1,2,3,4,5,6")  // comma-separated day indices (0=Sun..6=Sat)
presetKey        String?          // e.g. "medication", "water" — links to preset template
soundEnabled     Boolean @default(true)
notifyEnabled    Boolean @default(true)
```

The existing `schedule` String field is retired (keep for backward compat but stop using).

## 2. Preset Definitions

12 preset templates defined as a constant (not in DB):

| Key | Title | Default Time | Default Interval | Default Days | Type |
|-----|-------|-------------|-----------------|-------------|------|
| medication | Take Medication | 09:00 | null (daily) | All | medication |
| water | Drink Water | 08:00 | 120 min | All | hydration |
| eat | Eat a Meal | 12:00 | null | All | self-care |
| shower | Shower / Hygiene | 08:00 | null | All | self-care |
| bedtime | Start Winding Down | 22:00 | null | All | self-care |
| stretch | Stretch / Move | 10:00 | 120 min | 1,2,3,4,5 | break |
| break | Take a Break | 10:00 | 90 min | 1,2,3,4,5 | break |
| sunlight | Get Some Sunlight | 10:00 | null | All | self-care |
| breathe | Breathing Exercise | 12:00 | null | All | self-care |
| checkin | Body Check-in | 14:00 | null | All | self-care |
| tidy | 5-Minute Tidy | 17:00 | null | 1,2,3,4,5 | self-care |
| connect | Reach Out to Someone | 18:00 | null | All | self-care |

## 3. UI: ReminderList Redesign

### Top section: Preset grid + AI builder

Similar to RoutineList layout:
- **Left column**: Grid of preset cards (2-col). Each shows title, short description, default schedule summary. Click to pre-fill creation form.
- **Right column**: AI schedule builder. Textarea + "Generate" button. Parses natural language into time/interval/days fields and pre-fills form.
- "Custom reminder" button for blank creation.

### Creation form

When a preset is clicked or AI generates a schedule:
- Title (pre-filled from preset, editable)
- Optional message
- Type dropdown (pre-filled from preset)
- **Schedule section**:
  - Time picker (input type="time")
  - Interval dropdown: "Once a day", "Every 30 min", "Every hour", "Every 90 min", "Every 2 hours", "Every 3 hours", "Every 4 hours"
  - Day-of-week toggles: 7 small buttons (S M T W T F S), all active by default
  - Sound toggle
  - Browser notification toggle

### Header message

Show near the top: "Toggle any reminder on or off — they're here to help, not to overwhelm."

## 4. UI: ReminderItem with Inline Settings

### Collapsed state (default)
- Toggle switch (enable/disable)
- Title
- Schedule summary text (e.g. "Every 2h, weekdays" or "Daily at 9:00 AM")
- Type badge (colored)
- Gear icon button (click to expand)
- Snooze button (on hover)
- Delete button (on hover)

### Expanded state (click gear)
- Everything from collapsed, plus:
- Divider line
- Time picker
- Interval dropdown
- Day-of-week toggles (7 small toggle buttons)
- Sound on/off toggle
- Notification on/off toggle
- Changes auto-save via PATCH on change (optimistic update)

## 5. Notification System

### ReminderScheduler component

Mounts inside the dashboard layout (not per-tab — persists across tab changes):

1. On mount: fetch all enabled reminders with schedules
2. Every 60 seconds, check: should any reminder fire right now?
   - Compare current time (HH:MM) against `scheduledTime`
   - If `intervalMinutes` set, check if current time is within the active window and on-interval
   - Check `activeDays` includes current day-of-week
   - Check not snoozed
3. When firing:
   - Show in-app toast with: title, message, "Snooze", "Dismiss", "Turn off this reminder" link
   - If `notifyEnabled` and permission granted: send browser Notification with title + message
   - If `soundEnabled`: play a short gentle chime (use Web Audio API or a small audio file)
4. Track fired reminders in a Set (by reminder ID + time window) to avoid duplicate alerts

### Browser notification permission

- First time a user creates a reminder with `notifyEnabled: true`, show a prompt explaining what browser notifications do and request permission
- If denied, fall back to in-app toasts only (no error, just graceful degradation)
- Store permission state in component state (from `Notification.permission`)

### Notification toast variant

A new toast style for reminders (distinct from success/error toasts):
- Wider, with action buttons
- Shows reminder title and optional message
- Three actions: "Snooze 30m", "Dismiss", "Turn off"
- Auto-dismisses after 30 seconds (longer than regular toasts)

## 6. API Changes

### PATCH /api/reminders/[id]

Add support for new fields: `scheduledTime`, `intervalMinutes`, `activeDays`, `soundEnabled`, `notifyEnabled`, `presetKey`

### POST /api/reminders

Add support for same new fields on creation.

### POST /api/reminders/schedule-ai

New endpoint. Accepts `{ prompt: string }` and returns `{ scheduledTime, intervalMinutes, activeDays, title?, type? }`. Uses the existing Gemini AI integration pattern from routines/generate.

### GET /api/reminders

Already returns all fields — no change needed since Prisma returns all columns.

## 7. Sound Asset

Include a small notification chime sound file (`public/sounds/reminder-chime.mp3`). Generate or use a gentle, short tone (~1 second). This can be synthesized via Web Audio API instead if preferred (no external file needed).
