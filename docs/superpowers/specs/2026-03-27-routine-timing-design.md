# Routine Time & Duration Scheduling — Design Spec

## Overview

Add optional time and duration scheduling to routines. Each routine can operate in three modes: timed (start time + auto-calculated step times + durations), duration-only (durations per step, total at top), or pure checklist (current behavior). Controlled by two per-routine toggles.

## Data Model Changes

### RoutineStep — add field:
- `durationMinutes Int?` — how long this step takes in minutes

### Routine — add fields:
- `startTime String?` — when the routine begins, HH:MM 24h format
- `showTimes Boolean @default(false)` — display calculated clock times
- `showDurations Boolean @default(true)` — display durations per step

### Mode Logic:
- showTimes=true forces showDurations=true
- showTimes=false + showDurations=true = duration only
- showTimes=false + showDurations=false = pure checklist

## Templates Updated

| Template | startTime | showTimes | showDurations | Steps (title, duration) |
|----------|-----------|-----------|---------------|------------------------|
| Morning | 06:00 | true | true | Stretch (5), Water (5), Goals (10), Breakfast (15) |
| Wind-Down | 22:00 | true | true | Screens off (5), Stretching (10), Read (15), Prep (10) |
| Work Focus | 09:00 | true | true | Clear desk (5), Priorities (10), Close tabs (5), Focus timer (25) |
| Self-Care | null | false | false | Skincare (null), Journal (null), Move (null), Enjoy (null) |

## UI Changes

### RoutineForm:
- Two toggle switches below routine name: "Show times" / "Show durations"
- When showTimes on: "Starts at" time picker appears
- Each step row gains optional duration input (number, "min" label) when showDurations on
- Steps submitted as objects: { title, durationMinutes? }

### RoutineCard:
- Timed mode: step rows show calculated time + duration on right. Header: "Starts at X · Y min total"
- Duration mode: step rows show duration on right. Header: "Y min total"
- Checklist mode: current behavior unchanged
- Mode toggles accessible via the existing settings/gear area

## API Changes

- POST /api/routines: accept startTime, showTimes, showDurations on routine; accept durationMinutes on steps
- PATCH /api/routines/[id]: accept same new fields
- GET /api/routines: return new fields (Prisma returns all by default)
- Step creation: handle both string[] and {title, durationMinutes?}[] formats
