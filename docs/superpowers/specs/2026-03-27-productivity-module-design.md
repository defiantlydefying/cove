# Productivity Module Design Spec

## Overview

A new "Productivity" tab in Cove combining four tightly integrated features: a focus timer, a daily planner, goals & habits tracking, and time tracking. Built as a single component tree with shared React context and a unified `/api/productivity/` API namespace.

## Layout

Sidebar-timer layout:
- **Right panel**: Focus timer with session controls, task linking, and time tracking summary
- **Main area (top)**: Daily planner with two switchable view modes
- **Main area (bottom)**: Goals & habits section

## Architecture

**Approach: Single component tree with shared state**

- `ProductivityPanel` is the top-level component, registered as a tab module in the dashboard
- `ProductivityContext` (React context) manages shared state: active timer, planner items, goals, habits, time entries
- Sub-components consume context directly — no prop drilling
- Single initial data fetch on mount, with optimistic updates for mutations
- API routes under `/api/productivity/` with sub-routes for each domain

### Component Structure

```
src/components/productivity/
  ProductivityPanel.tsx          # Top-level layout (main + sidebar)
  ProductivityContext.tsx         # Shared state context + provider
  FocusTimer.tsx                 # Timer with controls, task linking
  DailyPlanner.tsx               # Planner container with view toggle
  PlannerPriorityView.tsx        # Priority zones + time blocks
  PlannerListView.tsx            # Simple ordered list view
  PlannerItem.tsx                # Individual planner item (shared between views)
  TimeBlock.tsx                  # Google Calendar-style time block
  GoalsHabits.tsx                # Goals & habits container
  HabitItem.tsx                  # Daily habit with streak + weekly dots
  GoalItem.tsx                   # Weekly goal with progress bar
  TimeSummary.tsx                # Time tracked today/this week display
```

### API Routes

```
src/app/api/productivity/
  route.ts                       # GET all productivity data for today/this week
  focus-sessions/route.ts        # POST start/complete session, GET session history
  planner/route.ts               # GET/POST/PATCH/DELETE planner items
  planner/reorder/route.ts       # PATCH reorder items or change zones
  goals/route.ts                 # GET/POST/PATCH/DELETE goals
  habits/route.ts                # GET/POST/PATCH/DELETE habits
  habits/[id]/check/route.ts     # POST mark habit done for today
  time-entries/route.ts          # GET/POST manual time entries
```

## Data Model (Prisma)

### FocusSession

Tracks completed pomodoro/focus sessions.

```prisma
model FocusSession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  label         String?
  taskId        String?
  task          Task?    @relation(fields: [taskId], references: [id])
  durationMin   Int
  sessionType   String   @default("focus")   // focus | short-break | long-break
  completedAt   DateTime @default(now())
  createdAt     DateTime @default(now())

  @@index([userId, completedAt])
}
```

### PlannerItem

Items in the daily planner, with optional time blocks.

```prisma
model PlannerItem {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String
  date          DateTime  @db.Date
  zone          String    @default("must")    // must | should | could
  sortOrder     Int       @default(0)
  startTime     String?                       // HH:MM format
  endTime       String?                       // HH:MM format
  completed     Boolean   @default(false)
  taskId        String?
  task          Task?     @relation(fields: [taskId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, date])
}
```

### Habit

Repeating daily habits with streak tracking.

```prisma
model Habit {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  title         String
  currentStreak Int           @default(0)
  longestStreak Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  checks        HabitCheck[]
  linkedGoals   WeeklyGoal[]

  @@index([userId])
}
```

### HabitCheck

Daily completion records for habits.

```prisma
model HabitCheck {
  id        String   @id @default(cuid())
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  createdAt DateTime @default(now())

  @@unique([habitId, date])
}
```

### WeeklyGoal

Target-based weekly goals with optional habit linkage.

```prisma
model WeeklyGoal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  targetCount   Int
  currentCount  Int      @default(0)
  weekStart     DateTime @db.Date             // Monday of the target week
  linkedHabitId String?
  linkedHabit   Habit?   @relation(fields: [linkedHabitId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, weekStart])
}
```

### TimeEntry

Manual time entries for things done outside the focus timer.

```prisma
model TimeEntry {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  label       String
  durationMin Int
  date        DateTime @db.Date
  taskId      String?
  task        Task?    @relation(fields: [taskId], references: [id])
  createdAt   DateTime @default(now())

  @@index([userId, date])
}
```

## Feature Details

### Focus Timer (right sidebar)

- Pomodoro timer with configurable durations: work (default 25 min), short break (5 min), long break (15 min)
- Long break triggers after every 4 focus sessions
- Controls: Start, Pause, Reset
- Optional task linking via dropdown (fetches from existing tasks) or free-text label
- Session auto-logged to `FocusSession` on completion
- Audio chime on session end (reuse 587Hz sine wave pattern from ReminderScheduler)
- Displays: current time remaining, session type, completed sessions today
- Below timer: `TimeSummary` showing total focused time today and this week, with a bar chart for the week (Mon-Sun)

### Daily Planner (main area, top)

- Toggle between two views: **Priority Zones** (default) and **List View**
- Date picker defaulting to today

**Priority Zones view:**
- Three columns: "Must Do", "Should Do", "Could Do"
- Items can be dragged between zones to reprioritize
- Items with start/end times render as Google Calendar-style time blocks: colored rounded bars spanning their duration, showing title and time range inline, stacking when overlapping
- A visual time axis on the left side for the time block area
- Items without times appear as simple checkable rows within their zone

**List View:**
- Simple ordered list, drag to reorder
- Each item shows: checkbox, title, optional time estimate
- Completed items show strikethrough with reduced opacity

**Shared behavior (both views):**
- Inline item creation (type and press Enter)
- Can pull items from existing tasks via a link button
- Checkbox to mark complete, completed items fade with strikethrough
- Edit item title/times inline
- Delete with confirmation

### Goals & Habits (main area, bottom)

**Daily Habits:**
- List of repeating habits the user checks off each day
- Each shows: title, tap-to-complete checkbox, current streak count, weekly dot grid (7 dots, filled = completed that day)
- Streak auto-calculated from consecutive `HabitCheck` records
- Add new habit inline, edit/delete existing

**Weekly Goals:**
- Target-based items with a progress bar (e.g., "3/5 complete")
- Optional link to a habit — when linked, `currentCount` auto-increments when the linked habit is checked for the day
- Manual increment/decrement for unlinked goals
- Week resets on Monday (new `WeeklyGoal` record per week)
- Add new goal inline, edit/delete existing

### Time Tracking (integrated)

- Focus timer sessions auto-create `FocusSession` records
- Planner items with time blocks contribute calculated duration
- Manual `TimeEntry` creation via "Add time" button in the timer sidebar
- `TimeSummary` component aggregates all three sources:
  - Today: total hours/minutes, session count
  - This week: bar chart (Mon-Sun) with daily totals
  - Breakdown by task/label (collapsible)

## Integration with Dashboard

- Add `{ id: "productivity", label: "Productivity" }` to `defaultTabs` in `dashboard/page.tsx`
- Add `productivity: true` to `defaultModuleStates`
- Render `<ProductivityPanel />` when `activeTab === "productivity"`
- Daily View can optionally show a compact "today's focus" summary by fetching from `/api/productivity`

## Styling

- Follow the cove design system: `cove-accent`, `cove-card`, `cove-border`, `cove-charcoal`, `cove-muted`, etc.
- No emojis anywhere in the UI
- Skeleton loading states for all data sections
- Toast notifications for actions (session complete, habit checked, goal reached)
- Error states with retry option
- Time blocks use `cove-accent` as primary color, `cove-heather` and `cove-amber` for secondary/tertiary

## Testing

- Unit tests for each sub-component following existing patterns (test-utils wrapper, mocked fetch)
- Test timer state transitions (focus -> break -> focus)
- Test planner CRUD and view switching
- Test habit streak calculation
- Test weekly goal auto-increment from linked habits
- Test time tracking aggregation
