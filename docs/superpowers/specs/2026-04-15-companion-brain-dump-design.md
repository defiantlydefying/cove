# Companion System & Brain Dump — Design Spec

## Summary

Add an animal companion system that becomes the voice and personality of the entire cove app, paired with a zero-friction brain dump / quick capture feature. The companion delivers all system messages, runs the brain dump interface, and has a dedicated interaction screen. Voice and text input are both first-class.

## Companion Roster

7 selectable animal companions, each with a distinct personality:

| Companion | Habitat | Personality | Voice style |
|-----------|---------|-------------|-------------|
| Otter | Coastal | Cheerful buddy | Upbeat, celebrates wins. "You did the thing! Tiny victory dance!" |
| Turtle | Coastal | Calm sage | Wise, thoughtful, drops insights. "Sometimes the smallest step is the bravest one." |
| Seal | Coastal | Warm & accepting | Easygoing, validating. "Hey, you're here. That's already enough." |
| Owl | Forest | Quiet librarian | Minimal, only speaks when it matters. "You're back." / "Three days. Consistent." |
| Fox | Forest | Cozy camp counselor | Curious, warm, slightly playful. "What's on your mind today? Let's figure it out together." |
| Deer | Forest | Soft & observant | Notices small things, reflective. "I noticed you've been showing up more this week. That matters." |
| Frog | Both | Quirky & goofy | Lighthearted, low-pressure. "One hop at a time, friend." |

- Selected during onboarding (new step after module selection)
- Switchable anytime in settings
- Each has: illustrated avatar (placeholder colored circle + emoji initially), personality description, sample dialogue preview

## Companion Screen (Dedicated Tab)

New tab in the dashboard navigation, positioned first (becomes the landing screen).

### Layout
- Companion avatar at top (large)
- Greeting message below avatar (adapts to time of day, absence length, recent activity)
- Chat-style message area showing companion responses and brain dump items
- Input bar at bottom: text field + mic button + send button

### Behavior
- On open: companion greets user in-character
- User types or speaks thoughts — they appear as user messages in the chat
- Companion responds with short in-character acknowledgments
- Each user message is saved as an InboxItem
- "Help me sort" button appears when there are unprocessed inbox items — triggers AI categorization
- Companion can initiate check-in prompts: "How's your energy today?" (flows into wellness tracking)

### Greeting Logic (Gap Recovery)
- 0-3 days since last session: Normal time-of-day greeting
- 4-7 days: Warm welcome back, no mention of missed items. "Hey, good to see you! What's on your mind?"
- 8+ days: Extra gentle. "It's been a little while — no worries at all. Want to start fresh today?" Offers to clear/archive old inbox items.
- Never shows overdue counts or shame messaging

## Quick Capture (Global)

- Floating action button (FAB) visible on every dashboard screen, bottom-right, above tab bar
- Tap opens a minimal overlay/bottom sheet: companion avatar + text field + mic button + send
- Submitting adds an InboxItem and shows a brief companion one-liner ("Got it!" / "Holding that for you")
- Overlay dismisses after send, user stays on current screen
- No organization required at capture time

## Voice Input

- Available on companion screen input bar and quick capture overlay
- Tap mic icon to start recording, tap again to stop
- Uses Web Speech API (SpeechRecognition) for browser-based speech-to-text
- Transcript populates the text field, user can edit before sending or auto-send
- Visual feedback during recording (pulsing mic icon)
- Fallback: if Speech API unavailable, mic button is hidden

## Inbox System

- All captured thoughts (text and voice) land as InboxItems
- Viewable from companion screen (inline in chat) and as a dedicated section accessible from companion screen header
- Each item shows: content, timestamp, source icon (keyboard/mic)
- Item actions: convert to task, convert to reminder, dismiss, or bulk "Help me sort"
- "Help me sort" triggers AI: companion analyzes unprocessed items and suggests categorization (task, reminder, routine step, or just a note). User approves/tweaks per item with one tap.
- Stale items don't generate guilt — companion may gently mention "You've got some thoughts saved up" after 3+ days, but only once, never nags
- Dismissed items are soft-deleted (hidden, not destroyed)

## Companion Voice in Existing Features

The companion's personality replaces generic system copy throughout the app:

- **Toast messages**: Task completed, streak updated, achievement unlocked
- **Empty states**: No tasks yet, no routines, no check-ins
- **Reminders**: Notification text uses companion tone
- **Streak updates**: Daily/weekly summaries
- **Welcome back**: Dashboard greeting
- **Error states**: Gentle, in-character error messages

### Implementation approach
- Static microcopy: each companion has a map of `context -> message variants[]` (random selection for variety)
- AI-generated messages: companion type is included in the system prompt to shape tone
- Microcopy is stored in a `companionCopy.ts` file organized by companion type and context

## Data Model Changes

### New field on UserSettings
```
companionType  String  @default("fox")  // otter, turtle, seal, owl, fox, deer, frog
```

### New model: InboxItem
```
model InboxItem {
  id          String   @id @default(cuid())
  userId      String
  content     String
  source      String   @default("text")  // text, voice
  status      String   @default("unprocessed")  // unprocessed, converted, dismissed
  convertedTo String?  // task, reminder, routine, note
  convertedId String?  // ID of the created task/reminder/etc
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### User model addition
```
inboxItems  InboxItem[]
```

## API Routes

- `GET /api/inbox` — Fetch user's inbox items (filterable by status)
- `POST /api/inbox` — Create inbox item (brain dump capture)
- `PATCH /api/inbox/[id]` — Update item (dismiss, convert)
- `DELETE /api/inbox/[id]` — Hard delete
- `POST /api/inbox/sort` — AI-powered categorization of unprocessed items
- `POST /api/companion/greeting` — Generate contextual greeting based on companion type, time, absence length, recent activity
- `PATCH /api/settings` — Already exists, extended to include companionType

## Component Structure

### New components
- `CompanionScreen` — Main companion tab with chat interface
- `CompanionAvatar` — Renders companion illustration (used everywhere)
- `CompanionGreeting` — Generates and displays contextual greeting
- `CompanionMessage` — Single chat message bubble (companion or user)
- `QuickCapture` — FAB + overlay for global brain dump
- `QuickCaptureOverlay` — Bottom sheet with input + mic
- `VoiceInput` — Mic button with Web Speech API integration
- `InboxList` — Scrollable list of inbox items
- `InboxItem` — Single inbox item with action buttons
- `InboxSorter` — AI sort interface (companion suggests, user approves)
- `CompanionPicker` — Selection grid for onboarding + settings

### Modified components
- `AppShell` / `TabBar` — Add companion tab, add FAB
- `OnboardingWizard` — Add companion selection step
- `SettingsPanel` — Add companion switcher
- Toast/notification components — Route through companion copy system

## Onboarding Flow

New step inserted after module selection:

1. Module selection (existing)
2. **Companion selection (new)** — Grid of 7 animals with avatar, name, personality tagline, and sample quote. Tap to select, tap again to confirm.
3. Theme/density (existing)
4. Profile (existing)

## Technical Notes

- Voice input uses the Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`). No external API needed for speech-to-text in the browser. For Capacitor native builds, the Capacitor Speech Recognition plugin can be used as a future enhancement.
- AI sorting uses the existing pattern from routine generation — server-side API call with structured prompt.
- Companion greeting can be generated client-side from templates for speed, with optional AI enhancement for variety.
- The companion screen becomes the default landing tab (first tab in navigation).
