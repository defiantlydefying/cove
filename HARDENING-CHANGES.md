# Cove Design & Hardening Changes

Summary of all changes made during the `/harden`, `/bolder`, `/colorize`, `/onboard`, and `/typeset` passes.

---

## `/bolder` Pass — Warm Organic Palette

### Color Palette Overhaul (`globals.css`)

Replaced the entire AI-generic purple-blue palette with warm earth tones:

| Token | Before (Purple/Blue) | After (Warm/Organic) | Role |
|-------|---------------------|---------------------|------|
| `--cove-accent` | `#7B6FD4` (purple) | `#6B8F71` (sage green) | Primary action, active states |
| `--cove-accent-hover` | `#6A5EC3` | `#5A7D60` | Hover state |
| `--cove-accent-light` | `#EEEAFD` (lavender) | `#EAF0EB` (light sage) | Soft backgrounds |
| `--cove-blue` | `#6BAFDE` (sky blue) | `#7EAAA0` (teal) | Secondary accent |
| `--cove-sage` | `#9BA3D6` (periwinkle) | `#8FA89A` (muted sage) | Tertiary |
| `--cove-sand` | `#E6E0F3` (lilac) | `#E8E0D4` (warm sand) | Soft fill |
| `--cove-offwhite` | `#F5F3FC` (cool) | `#F7F5F0` (warm cream) | Page background |
| `--cove-charcoal` | `#2B2D42` (blue-black) | `#3D3832` (warm charcoal) | Primary text |
| `--cove-muted` | `#9494AC` (cool gray) | `#9A928A` (warm gray) | Secondary text |
| `--cove-card` | `#FFFFFF` | `#FFFDF9` (warm white) | Card backgrounds |
| `--cove-sidebar` | `#5A4BAA` (purple) | `#4A5D4E` (forest green) | Sidebar/header |

New tokens added: `--cove-terracotta` (`#C4795B`), `--cove-amber` (`#C4A055`) for warm accent variety.

Dark theme updated to match with warm dark tones instead of cool blue-black.

### Component Visual Changes

- **AppShell header**: Replaced `bg-gradient-to-r from-purple to-blue` with solid `bg-cove-sidebar` (forest green)
- **TabBar active indicator**: Replaced gradient underline with solid `bg-cove-accent`
- **Routine templates**: Replaced arbitrary color gradients with warm, tinted background cards (amber, sage, teal, terracotta)
- **All gradient buttons**: Replaced `from-purple-500 to-blue-500` with solid `bg-cove-accent` throughout RoutineForm, RoutineList, RoutineCard
- **All purple focus rings**: Replaced `focus:ring-purple-300` with `focus:ring-cove-accent/40`
- **Progress bars**: Replaced gradient fills with solid `bg-cove-accent`
- **CheckinForm circles**: Replaced gradient backgrounds with solid accent color
- **Medication badge**: Changed from `bg-purple-50 text-purple-600` to `bg-cove-accent-light text-cove-accent`
- **Login/Register pages**: Removed gradient backgrounds, softened shadows to warm tones
- **Tab shadow**: Updated from purple-tinted to sage-tinted

---

---

## `/colorize` Pass — Semantic Color Strategy

Added **heather** (`#A08BA0`) as a fourth accent, and applied a semantic color strategy across the app:

### Color Roles

| Color | Token | Role | Used For |
|-------|-------|------|----------|
| Sage green | `--cove-accent` | Primary/health | Buttons, toggles, active states, wellness card border |
| Teal | `--cove-blue` | Secondary/routines | Routine progress bars, routine card border, hydration badge |
| Amber | `--cove-amber` | Achievement/attention | XP numbers, high-priority indicators, reminder card border, self-care badge |
| Heather | `--cove-heather` | Soft/personal | Onboarding condition chips, medication badge, low wellness levels |

### Specific Changes

- **DailyView card borders**: Each section gets its own accent — sage (tasks), teal (routines), sage (wellness), amber (reminders)
- **Priority indicators**: Changed from generic `red-500`/`gray-400` to `cove-amber`/`cove-muted`
- **GamificationPanel**: Total XP number and achievement rewards now amber — gives the progress section warm "gold" energy
- **StreakCard**: XP display uses amber
- **WellnessHistory level badges**: Replaced generic Tailwind colors (red/orange/yellow/emerald) with palette (heather/amber/sand/teal/sage)
- **WellnessHistory mini bars**: Replaced `yellow-400`/`orange-400` with `cove-blue`/`cove-amber`
- **ReminderItem type badges**: All badge colors now use palette tokens (hydration=teal, break=sage, medication=heather, self-care=amber, custom=sand)
- **Settings accent swatches**: Updated from random colors to palette colors
- **Onboarding condition chips**: Selected state uses heather instead of sage — softer tone for sensitive personal info

---

---

## `/typeset` Pass — Typography Hierarchy

### Type Scale Standardized

| Level | Treatment | Used For |
|-------|-----------|----------|
| Page title (h1) | `text-2xl font-semibold tracking-tight` | DailyView greeting, Settings title, Login/Register headings |
| Section heading (h2) | `text-lg font-semibold tracking-tight` | "Routines", "Achievements", "Recent Check-ins", CheckinForm title |
| Card heading (h3) | `font-semibold` (base size) | DailyView card sections: "Tasks", "Routines", "How are you feeling?" |
| Card subheading | `text-sm font-semibold` | Settings section labels |
| Body | `text-sm` | Card content, form labels, descriptions |
| Caption | `text-xs` | Timestamps, helper text, metadata |

### Changes

- **DailyView**: Page greeting changed from `font-bold` to `font-semibold tracking-tight` (less heavy, more refined)
- **CheckinForm**: Title changed from `text-xl font-bold` to `text-lg font-semibold tracking-tight` (consistent with other section headings)
- **WellnessHistory**: Added `tracking-tight` to heading
- **RoutineList**: Added `tracking-tight` to heading
- **GamificationPanel**: Added `tracking-tight` to achievements heading
- **Settings page (full rewrite)**:
  - Added proper `text-2xl font-semibold tracking-tight` page title
  - Every setting section now has a label (`text-sm font-semibold`) + description (`text-xs text-cove-muted`)
  - Theme/density/font-size/tone selections use styled toggle buttons instead of bare radio inputs
  - Toggle switches use `button role="switch"` (accessible) instead of inconsistent implementations
  - Module toggles in cards with name + description instead of bare list
  - All modules now include descriptions explaining what they do
  - Consistent `space-y-10` vertical rhythm between sections

---

## `/onboard` Pass — Empty States & First-Run Guidance

Every empty state was rewritten to teach the interface and guide users to their first action, with warm, encouraging copy appropriate for neurodivergent users.

| Component | Before | After |
|-----------|--------|-------|
| TaskList (sidebar) | "No tasks yet." | "Your task list is empty" + guidance to type and press Enter |
| RoutineList | "No routines yet" | "Routines bring structure to your day" + explains what a routine is |
| ReminderList | "No reminders yet" | "Gentle nudges when you need them" + explains types + CTA button |
| WellnessHistory | "No check-ins yet" | "Your wellness story starts here" + explains what patterns will show |
| GamificationPanel (streaks) | "No streaks yet" | "Build your momentum" + explains how streaks grow |
| DailyView (empty day) | "All caught up! Nothing on your plate today." | "A clean slate" + guides to sidebar/tabs without pressure |

**Principles applied**:
- Each empty state has a short headline (what), descriptive text (why), and where relevant a clear action (how)
- Copy avoids pressure — phrases like "even one thing counts" and "just enjoy the quiet" respect that neurodivergent users may not always want to add more
- ReminderList empty state includes an inline "Create your first reminder" button so users can act without searching for the + button

---

## `/harden` Pass — Error Handling, User Feedback, Accessibility

## Infrastructure

### Toast Notification System
- **New file**: `src/components/providers/ToastProvider.tsx` — Context-based toast system with `useToast()` hook
- Supports `success`, `error`, and `info` toast types
- Uses `aria-live="polite"` for screen reader announcements
- Auto-dismisses after 3.5 seconds
- Wired into root layout (`src/app/layout.tsx`)

### Test Utilities
- **New file**: `src/test-utils.tsx` — Wrapped `render()` that includes ToastProvider for all tests

## Global CSS (`src/app/globals.css`)

| Change | Before | After |
|--------|--------|-------|
| Font | `font-family: Arial, Helvetica, sans-serif` | `font-family: var(--font-geist-sans), system-ui, sans-serif` |
| Border radius | `* { border-radius: inherit }` (dangerous wildcard) | Removed — only explicit `button, input, select, textarea` rule remains |
| Reduced motion | None | Full `prefers-reduced-motion: reduce` media query disabling all animations/transitions |
| Toast animation | N/A | Added `@keyframes toastIn` and `.animate-toast-in` |

## Component Changes

### TaskList (`src/components/tasks/TaskList.tsx`)
- **Error state with retry**: Shows "Couldn't load tasks" with "Try again" button instead of silently failing
- **Skeleton loading**: Three pulsing placeholder bars instead of bare "Loading tasks..." text
- **Toast on all operations**: Add, toggle, delete all show success/error toasts
- **Delete confirmation**: Inline confirmation prompt before deleting tasks
- **Better empty state**: "No tasks yet. Type above and press Enter to add one." instead of just "No tasks yet."

### TaskInput (`src/components/tasks/TaskInput.tsx`)
- Added `maxLength={200}` to prevent extremely long task names

### TaskItem (`src/components/tasks/TaskItem.tsx`)
- Added `break-words` class to task title for long text overflow handling

### TaskDetail (`src/components/tasks/TaskDetail.tsx`)
- **Error toast on save failure**: Shows "Couldn't save task" instead of silently reverting
- Added `maxLength={200}` and `required` to title input

### DailyView (`src/components/daily/DailyView.tsx`)
- **Error state with retry**: Full error card with retry button instead of bare "Failed to load daily view."
- **Skeleton loading**: Grid of pulsing placeholder cards instead of bare text
- **Toast on all operations**: Task toggle, step toggle, wellness submit, snooze all show toasts
- **Wellness labels in summary**: Shows "Mood: Good/5" instead of "Mood: 4/5" so labels persist after check-in
- **Accessibility**: Priority dots now have `sr-only` text labels ("High priority", "Low priority") for screen readers
- **Accessibility**: Progress bars have `role="progressbar"` with `aria-valuenow/min/max`
- **Text overflow**: Added `break-words` throughout for long content

### RoutineList (`src/components/routines/RoutineList.tsx`)
- **Error state with retry**: Shows error card with retry button
- **Skeleton loading**: Pulsing placeholder cards
- **Toast on all operations**: Create, delete, step toggle
- **Delete confirmation**: Inline prompt with "This can't be undone" warning
- **Better empty state**: Card with explanation instead of bare text
- Added `maxLength={500}` to AI prompt textarea

### RoutineForm (`src/components/routines/RoutineForm.tsx`)
- **Error toast on AI suggestion failure**: Shows error instead of silently failing
- Added `maxLength={100}` and `required` to routine name input

### WellnessTracker (`src/components/wellness/WellnessTracker.tsx`)
- **Error state with retry**: Error card with retry button
- **Skeleton loading**: Pulsing placeholders for form and history
- **Toast on operations**: Check-in submit shows success/error
- **Responsive layout**: Changed `flex` to `flex-col md:flex-row` so it stacks on mobile instead of breaking

### CheckinForm (`src/components/wellness/CheckinForm.tsx`)
- **Double-submit prevention**: Submit button disables during save, shows "Saving..."
- **Focus ring on radio buttons**: Added `focus-visible:ring-2` for keyboard accessibility

### WellnessHistory (`src/components/wellness/WellnessHistory.tsx`)
- **Better empty state**: Card with guidance instead of bare text
- **Responsive table**: Added `overflow-x-auto` and `min-w-[480px]` so table scrolls on small screens

### ReminderList (`src/components/reminders/ReminderList.tsx`)
- **Error state with retry**: Error message with retry link
- **Skeleton loading**: Pulsing placeholders
- **Toast on all operations**: Create, toggle, delete, snooze
- **Delete confirmation**: Inline confirmation prompt
- **Better empty state**: Card explaining what reminders do
- **Color consistency**: Changed `indigo-500` to `cove-accent` throughout

### ReminderItem (`src/components/reminders/ReminderItem.tsx`)
- **Color consistency**: Toggle switch changed from `bg-indigo-500` to `bg-cove-accent`
- **Text overflow**: Added `break-words` to title

### ReminderForm (`src/components/reminders/ReminderForm.tsx`)
- **Color consistency**: Button changed from `bg-indigo-500` to `bg-cove-accent`
- **Styling consistency**: Form inputs now use `rounded-xl`, `bg-cove-offwhite`, focus rings matching the rest of the app
- Added `maxLength` to title (150) and message (500) inputs
- Added `required` to title input

### GamificationPanel (`src/components/gamification/GamificationPanel.tsx`)
- **Error state with retry**: Error card with retry button
- **Skeleton loading**: Pulsing placeholders for XP and streak cards
- **Better empty state**: Card explaining how streaks work when none exist
- **XP formatting**: Uses `toLocaleString()` for large numbers (1,234 instead of 1234)
- **Contextual help**: Added explainer text under Total XP
- **Text overflow**: Added `break-words` and `min-w-0` to achievement names

### StreakCard (`src/components/gamification/StreakCard.tsx`)
- Added `aria-label` on streak count for screen reader clarity

### TabBar (`src/components/app-shell/TabBar.tsx`)
- **Accessibility**: Module toggle changed from `<span role="switch">` to focusable element with `tabIndex={0}` and keyboard event handlers (Enter/Space)

## Test Updates

All 7 affected test files updated:
- Import `render`/`screen`/`waitFor` from `@/test-utils` instead of `@testing-library/react`
- Fetch mocks updated to include `ok: true` matching new error checking
- Loading state assertions updated for skeleton loaders

**Result**: All 96 tests pass, build compiles cleanly.
