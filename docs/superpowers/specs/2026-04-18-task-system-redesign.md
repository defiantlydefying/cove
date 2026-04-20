# Task System Redesign — Design Spec

## Overview

Rework Cove's task system from a flat sidebar checklist into a pipeline-based system inspired by Things 3 (Inbox/Today/Upcoming/Someday), with AI task breakdown (Goblin Tools-style), guilt-free deferral, and deep integration with the week calendar planner. Tasks live in both a minimal sidebar "Today" view and a full-page nav item with filtering and pipeline tabs.

## Data Model Changes

### Task Model Updates

Add to existing Task model:
- `status` (string, default "active") — `"active" | "completed" | "wont_do"`. Replaces boolean `completed` field. `completedAt` is still set when status changes to `completed`.
- `stage` (string, default "inbox") — `"inbox" | "today" | "upcoming" | "someday"`. Which pipeline stage the task is in.
- `scheduledDate` (optional Date) — when you plan to work on it (the "do date"). Separate from `deadline` (when it must be done by).
- `completedReason` (optional string) — for Won't Do reflection. Preset values: "not relevant", "too big", "scope changed", or freeform. Skippable.
- `deferredUntil` (optional Date) — task hidden until this date, then resurfaces into the appropriate stage.

Keep existing fields unchanged: `title`, `description`, `deadline`, `priority`, `energyLevel`, `parentId`, `sortOrder`, `isRecurring`, `recurrenceRule`, `createdAt`, `updatedAt`.

### PlannerItem Model Update

Add to existing PlannerItem model:
- `linkedTaskId` (optional string, foreign key to Task) — when set, completing the planner item completes the task and vice versa.

Add relation: `linkedTask Task? @relation(fields: [linkedTaskId], references: [id], onDelete: SetNull)` and corresponding `plannerLinks PlannerItem[]` on Task.

## Pipeline: Inbox → Today → Upcoming → Someday

### Inbox
Where tasks land by default. No date, no commitment. Just captured thoughts. Quick capture input at the top — type and press Enter, zero friction.

### Today
Tasks you commit to doing today. Populated by:
- Manual drag/assign from other stages
- Tasks with `scheduledDate` matching today (auto-moved by API)
- Tasks with `deadline` of today that aren't already in Today (surfaced automatically)

### Upcoming
Tasks with a `scheduledDate` or `deadline` in the future. Grouped by date. Shows the next 14 days.

### Someday
Tasks you might do but aren't committed to. Explicitly deferred. Not time-sensitive. Reviewed periodically via companion nudges.

### Smart Defaults
- New tasks go to Inbox (no date set)
- Setting `scheduledDate` to today → auto-moves to Today
- Setting `scheduledDate` to a future date → auto-moves to Upcoming
- Clearing `scheduledDate` → moves to Inbox (or Someday if explicitly deferred)

## Views

### Sidebar (Minimal "Today" View)

Lives in the right sidebar, same position as current TaskList. Shows only Today-stage tasks.

- Quick capture input at top (Enter to add, goes to Inbox by default; typing "today:" prefix or clicking a "+" icon adds directly to Today)
- Each task shows: checkbox, title, priority dot color, energy level badge (if set)
- Tap a task to expand inline: shows description, deadline, sub-task progress
- Progress indicator at top: "3 of 7 done" with a thin progress bar
- "Needs attention" collapsible section at top for overdue tasks (no red, no shame — see Overdue Handling)
- "View all tasks →" link at bottom switches main content to the full Tasks page

### Full Page (Nav Item: "Tasks")

New nav item in the left nav, positioned after Daily View. Icon: checkbox/list icon.

Top-level pills/tabs: **Inbox** | **Today** | **Upcoming** | **Someday** | **Done**

#### Inbox View
- Flat list of unscheduled, uncommitted tasks
- Sortable by: created date, priority, manual drag
- Bulk actions: "Move to Today", "Set date", "Break down"
- Empty state: "Your inbox is clear — nothing unprocessed"

#### Today View
- Ordered by priority (high → medium → low), then manual sort within priority
- Shows energy level badges for at-a-glance capacity planning
- Progress bar at top: "3 of 7 done today"
- Overdue "Needs attention" section (collapsible, at top)
- Empty state: "A clear day. Add tasks from your inbox, or enjoy the space."

#### Upcoming View
- Grouped by date (today+1 through today+14)
- Each date group shows: day name, date, task count
- Tasks within each group ordered by priority
- Deadline indicators: small icon if task has a deadline distinct from scheduledDate

#### Someday View
- Simple flat list
- "Move to Today" and "Schedule" actions on hover
- Companion nudge trigger: items older than 2 weeks get a gentle "Still interested?" prompt (once per item)
- Empty state: "Nothing deferred — everything has a place"

#### Done View
- Recent completions (last 30 days), newest first
- Shows completion date and earned XP
- "Won't Do" items shown in a separate sub-section with their reasons
- "Restore" action to move back to Inbox

#### Filtering (available in all views)
- Priority: High / Medium / Low
- Energy level: Low energy / Moderate / High focus
- Has deadline: Yes / No
- Has sub-tasks: Yes / No
- Filters are toggles in a collapsible bar below the tabs

#### Sorting (available in all views)
- Priority (default)
- Deadline (soonest first)
- Created date (newest first)
- Manual (drag to reorder)

## Task Actions

### Complete
Checkbox toggle. Sets `status` to `completed`, `completedAt` to now. Triggers gamification: `recordActivity(userId, "tasks")` for XP + achievement check. Haptic feedback on mobile. If task has a linked PlannerItem, marks that as completed too.

### Defer
Popover with options:
- **Tomorrow** — sets `scheduledDate` to tomorrow, `stage` to "upcoming"
- **Next week** — sets `scheduledDate` to next Monday, `stage` to "upcoming"
- **Someday** — clears `scheduledDate`, sets `stage` to "someday"
- **Pick a date** — date picker, sets `scheduledDate` and `stage` to "upcoming"

Sets `deferredUntil` for Tomorrow/Next week options. Task disappears from current view and reappears on the deferred date.

### Won't Do
Sets `status` to `wont_do`. Optional reason popover:
- Preset buttons: "Not relevant", "Too big", "Scope changed"
- Freeform text input (placeholder: "Why? (optional)")
- "Skip" button to archive without reason
Stores in `completedReason`. Task moves to Done view under "Won't Do" sub-section.

### Break Down (AI)
See AI Task Breakdown section below.

### Schedule
Set `scheduledDate` via a date picker. Auto-assigns `stage` based on the date (today → "today", future → "upcoming").

### Set Deadline
Set `deadline` via a date picker. Separate from `scheduledDate`. Shows as a small indicator on the task.

### Drag to Calendar
See Planner Integration section below.

## AI Task Breakdown

### On-Demand Button
Every task has a "Break it down" action (icon: split/branch icon). Opens an inline panel below the task:

- **Granularity slider**: labeled 1–5
  - 1: "Broad steps" (3-4 high-level steps)
  - 3: "Detailed steps" (5-8 steps with specifics)
  - 5: "Micro-steps" (10+ steps, very granular, for bad brain days)
- **Generate button**: calls AI with the task title + description + granularity level
- **Preview**: shows generated sub-tasks as a checklist before committing
- **Accept**: creates sub-tasks linked to the parent via `parentId`. Each sub-task is a full Task (can be individually completed, deferred, scheduled, etc.)
- **Regenerate**: try again with different phrasing
- **Cancel**: dismiss without creating

### Companion Nudge
When a task title is vague (heuristic: no verb, fewer than 4 words, or matches generic patterns like "stuff", "things", "project"), the companion gently suggests breakdown. Implementation:
- Small inline prompt below the task: "[Companion name] thinks this might be easier in smaller steps. Break it down?"
- Shows only once per task (tracked via a `breakdownSuggested` flag or local state)
- Dismissible with "No thanks" that hides it permanently for that task
- Respects user tone setting (encouraging vs neutral wording)

### AI Endpoint
`POST /api/tasks/breakdown`
- Input: `{ title: string, description?: string, granularity: 1-5 }`
- Output: `{ steps: { title: string }[] }`
- Uses the same AI provider as routine generation (existing pattern in codebase)
- Falls back to mock response if AI unavailable (same pattern as routines/generate)

## Sub-Tasks Display

- Parent task shows an inline progress indicator: "2 of 5 steps"
- Click/tap to expand: sub-tasks appear as an indented checklist below the parent
- Each sub-task has: checkbox, title, and a delete (X) button
- Completing all sub-tasks auto-completes the parent task
- Sub-tasks inherit the parent's `stage` and `scheduledDate` unless individually overridden
- Sub-tasks can be reordered via drag within the parent
- Sub-tasks do NOT appear as top-level items in any view — they only appear nested under their parent

## Planner Integration (Phase 2)

### Drag Task to Calendar
- Any task (from sidebar or full-page) is draggable
- Drag onto the week calendar grid → creates a linked PlannerItem
- The PlannerItem gets: `linkedTaskId` set, `title` copied from task, `startTime` from drop position, `endTime` = startTime + 30 minutes (default), `zone` = task's priority mapped to zone (high→must, medium→should, low→could)
- After drop, the EventEditor opens pre-filled so the user can adjust duration and time

### Linked Behavior
- **Complete time block → completes task**: When a linked PlannerItem is marked complete, the linked Task's `status` is set to `completed`. Gamification XP triggers from the task side.
- **Complete task → completes time block**: When the linked Task is completed (from sidebar or task page), the linked PlannerItem is marked as completed (visual strikethrough on calendar).
- **Delete time block → keeps task**: Removing the PlannerItem nullifies `linkedTaskId` on the task. The task remains in its pipeline stage.
- **Delete task → removes time block**: Deleting the task cascades to delete the linked PlannerItem (via onDelete: Cascade on the relation, or explicit API logic).

### Visual Indicators
- Tasks with linked time blocks show: small calendar icon + scheduled time text (e.g., "📅 Mon 2:00 PM")
- PlannerItems with linked tasks show: small checkbox icon in the time block header
- Color of the time block follows the task's priority-to-zone mapping

## Overdue Handling (No Shame)

- Overdue tasks (past `deadline` or past `scheduledDate` and not completed) do NOT turn red
- They appear in a collapsible "Needs attention" section at the top of the Today view (both sidebar and full page)
- Section header: "These slipped past their date" (neutral tone)
- Each overdue task shows three quick actions: "Do today" (reschedules to today), "Defer" (standard defer popover), "Let go" (Won't Do)
- No badge count on the nav item. No notification spam. No guilt.
- The section is collapsed by default if the user has dismissed it before (local storage)

## Companion Integration

Three nudge types, all dismissible, all respecting user tone settings:

1. **Vague task breakdown** — described in AI Task Breakdown section above
2. **Stale Someday items** — tasks in Someday stage for 14+ days get a one-time nudge: "You added '[title]' a while ago — still interested, or ready to let it go?" Actions: "Schedule it", "Keep for later", "Won't do"
3. **Overloaded Today** — when Today has 10+ incomplete tasks: "That's a lot for one day — want to move some to tomorrow?" Action: opens a quick triage view where you can bulk-defer

## Files to Change

### Phase 1: Task System Core

**Schema & API:**
- `prisma/schema.prisma` — add `status`, `stage`, `scheduledDate`, `completedReason`, `deferredUntil` to Task; add migration
- `src/app/api/tasks/route.ts` — add `?stage=` filter param, add `?search=` for title search, return tasks grouped by stage
- `src/app/api/tasks/[id]/route.ts` — support new fields in PATCH, handle stage auto-assignment on scheduledDate change, handle won't-do status
- New: `src/app/api/tasks/breakdown/route.ts` — AI breakdown endpoint

**Components:**
- Rewrite: `src/components/tasks/TaskList.tsx` — sidebar Today view with progress bar, needs-attention section, quick capture
- Update: `src/components/tasks/TaskItem.tsx` — add defer/won't-do/breakdown actions, sub-task expansion, draggable
- New: `src/components/tasks/TasksPage.tsx` — full-page wrapper with pipeline tabs
- New: `src/components/tasks/TaskPipeline.tsx` — renders Inbox/Today/Upcoming/Someday/Done with filtering
- New: `src/components/tasks/TaskBreakdown.tsx` — AI breakdown UI with granularity slider and preview
- New: `src/components/tasks/TaskActions.tsx` — defer popover, won't-do popover, schedule picker
- `src/app/dashboard/page.tsx` — add "Tasks" nav item to left nav

### Phase 2: Planner Integration

**Schema & API:**
- `prisma/schema.prisma` — add `linkedTaskId` to PlannerItem model, add relation; migration
- `src/app/api/productivity/planner/route.ts` — handle linked task completion sync
- `src/app/api/tasks/[id]/route.ts` — on task completion, sync linked PlannerItem

**Components:**
- `src/components/productivity/PlannerPriorityView.tsx` — accept task drop events, create linked PlannerItems
- `src/components/tasks/TaskItem.tsx` — add drag handle, show calendar link indicator
- `src/components/productivity/EventEditor.tsx` — show linked task info when editing a linked PlannerItem
