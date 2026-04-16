# Companion System & Brain Dump Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 selectable animal companions that become the app's voice, a conversational brain dump interface, global quick capture with voice input, and an inbox system with AI-powered sorting.

**Architecture:** New Prisma model `InboxItem` + `companionType` field on `UserSettings`. New companion tab as primary dashboard landing. Companion copy system maps animal type + context to personality-specific messages. Quick capture FAB available on all screens. Voice input via Web Speech API.

**Tech Stack:** Next.js 16, Prisma, framer-motion, Web Speech API, Google Generative AI (Gemini 2.5-Flash), vitest + testing-library

---

## File Structure

### New files
- `prisma/migrations/20260415000000_add_companion_and_inbox/migration.sql` — DB migration
- `src/lib/companionCopy.ts` — Personality-specific message templates per companion per context
- `src/lib/companions.ts` — Companion roster data (names, descriptions, avatars, sample quotes)
- `src/components/companion/CompanionScreen.tsx` — Main companion tab with chat UI
- `src/components/companion/CompanionAvatar.tsx` — Renders companion emoji/illustration
- `src/components/companion/CompanionMessage.tsx` — Chat message bubble
- `src/components/companion/CompanionPicker.tsx` — Selection grid for onboarding + settings
- `src/components/companion/QuickCapture.tsx` — FAB + overlay for global brain dump
- `src/components/companion/VoiceInput.tsx` — Mic button with Web Speech API
- `src/components/companion/InboxList.tsx` — List of inbox items with actions
- `src/components/companion/InboxSorter.tsx` — AI sort interface
- `src/app/api/inbox/route.ts` — GET/POST inbox items
- `src/app/api/inbox/[id]/route.ts` — PATCH/DELETE inbox item
- `src/app/api/inbox/sort/route.ts` — AI-powered categorization
- `src/app/api/companion/greeting/route.ts` — Contextual greeting generation

### Modified files
- `prisma/schema.prisma` — Add InboxItem model, companionType to UserSettings, inboxItems to User
- `src/app/dashboard/page.tsx` — Add companion tab (first position), add QuickCapture FAB
- `src/app/api/settings/route.ts` — Allow companionType in PATCH whitelist
- `src/components/onboarding/OnboardingWizard.tsx` — Add companion selection step
- `src/components/settings/SettingsPanel.tsx` — Add companion switcher
- `src/components/providers/ToastProvider.tsx` — Route toast messages through companion copy

---

### Task 1: Database — Add InboxItem Model and companionType Field

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260415000000_add_companion_and_inbox/migration.sql`

- [ ] **Step 1: Add InboxItem model and companionType to schema**

Add to `prisma/schema.prisma` — add `inboxItems InboxItem[]` to User model's relations (after `communityReports`), add `companionType` to UserSettings, and add InboxItem model at end of file:

In the User model, add after line `communityReports    CommunityReport[]`:
```prisma
  inboxItems          InboxItem[]
```

In the UserSettings model, add after `sidebarVisible Boolean @default(true)`:
```prisma
  companionType  String  @default("fox")
```

Add at the end of the file:
```prisma
model InboxItem {
  id          String   @id @default(cuid())
  userId      String
  content     String
  source      String   @default("text")
  status      String   @default("unprocessed")
  convertedTo String?
  convertedId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}
```

- [ ] **Step 2: Create migration SQL**

Create `prisma/migrations/20260415000000_add_companion_and_inbox/migration.sql`:
```sql
-- Add companion type to user settings
ALTER TABLE "UserSettings" ADD COLUMN "companionType" TEXT NOT NULL DEFAULT 'fox';

-- Create InboxItem table
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'text',
    "status" TEXT NOT NULL DEFAULT 'unprocessed',
    "convertedTo" TEXT,
    "convertedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- Create index for efficient queries
CREATE INDEX "InboxItem_userId_status_idx" ON "InboxItem"("userId", "status");

-- Add foreign key
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "InboxItem" ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 3: Apply migration**

Run: `npx prisma migrate deploy`
Expected: Migration applied successfully

- [ ] **Step 4: Generate Prisma client**

Run: `npx prisma generate`
Expected: Prisma Client generated

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260415000000_add_companion_and_inbox/
git commit -m "add InboxItem model and companionType to UserSettings"
```

---

### Task 2: Companion Data — Roster and Copy System

**Files:**
- Create: `src/lib/companions.ts`
- Create: `src/lib/companionCopy.ts`

- [ ] **Step 1: Create companion roster data**

Create `src/lib/companions.ts`:
```typescript
export type CompanionType = "otter" | "turtle" | "seal" | "owl" | "fox" | "deer" | "frog";

export interface Companion {
  type: CompanionType;
  name: string;
  emoji: string;
  habitat: "coastal" | "forest" | "both";
  personality: string;
  tagline: string;
  sampleQuote: string;
}

export const COMPANIONS: Companion[] = [
  {
    type: "otter",
    name: "Otter",
    emoji: "\uD83E\uDDA6",
    habitat: "coastal",
    personality: "Cheerful buddy",
    tagline: "Playful, celebrates wins, keeps things light",
    sampleQuote: "You did the thing! Tiny victory dance!",
  },
  {
    type: "turtle",
    name: "Turtle",
    emoji: "\uD83D\uDC22",
    habitat: "coastal",
    personality: "Calm sage",
    tagline: "Wise, thoughtful, drops insights when it matters",
    sampleQuote: "Sometimes the smallest step is the bravest one.",
  },
  {
    type: "seal",
    name: "Seal",
    emoji: "\uD83E\uDDAD",
    habitat: "coastal",
    personality: "Warm & accepting",
    tagline: "Easygoing, validating, makes you feel at home",
    sampleQuote: "Hey, you're here. That's already enough.",
  },
  {
    type: "owl",
    name: "Owl",
    emoji: "\uD83E\uDD89",
    habitat: "forest",
    personality: "Quiet librarian",
    tagline: "Minimal, only speaks when it matters",
    sampleQuote: "You're back. Let's begin.",
  },
  {
    type: "fox",
    name: "Fox",
    emoji: "\uD83E\uDD8A",
    habitat: "forest",
    personality: "Cozy camp counselor",
    tagline: "Curious, warm, slightly playful",
    sampleQuote: "What's on your mind today? Let's figure it out together.",
  },
  {
    type: "deer",
    name: "Deer",
    emoji: "\uD83E\uDD8C",
    habitat: "forest",
    personality: "Soft & observant",
    tagline: "Notices small things, reflective, quietly validating",
    sampleQuote: "I noticed you've been showing up more this week. That matters.",
  },
  {
    type: "frog",
    name: "Frog",
    emoji: "\uD83D\uDC38",
    habitat: "both",
    personality: "Quirky & goofy",
    tagline: "Lighthearted, low-pressure, a little silly",
    sampleQuote: "One hop at a time, friend.",
  },
];

export function getCompanion(type: CompanionType): Companion {
  return COMPANIONS.find((c) => c.type === type) ?? COMPANIONS[4]; // default fox
}
```

- [ ] **Step 2: Create companion copy system**

Create `src/lib/companionCopy.ts`:
```typescript
import { CompanionType } from "./companions";

type CopyContext =
  | "greeting_morning"
  | "greeting_afternoon"
  | "greeting_evening"
  | "greeting_return_short"   // 4-7 days away
  | "greeting_return_long"    // 8+ days away
  | "capture_ack"             // brain dump acknowledgment
  | "inbox_nudge"             // gentle reminder about unprocessed items
  | "task_complete"
  | "streak_update"
  | "achievement_unlock"
  | "empty_tasks"
  | "empty_routines"
  | "empty_inbox"
  | "sort_offer"
  | "sort_complete"
  | "error_generic";

const copy: Record<CompanionType, Record<CopyContext, string[]>> = {
  otter: {
    greeting_morning: [
      "Good morning! Ready to make some waves today?",
      "Rise and shine! What are we tackling first?",
    ],
    greeting_afternoon: [
      "Hey hey! How's the day going so far?",
      "Afternoon check-in! You doing okay?",
    ],
    greeting_evening: [
      "Evening! Let's wind things down nicely.",
      "Hey! Almost made it through another day. Nice work!",
    ],
    greeting_return_short: [
      "You're back! I missed you. What's up?",
      "Hey, welcome back! Anything on your mind?",
    ],
    greeting_return_long: [
      "It's been a minute! No worries at all — I'm just happy to see you. Fresh start?",
      "Hey hey, long time no see! Everything's right where you left it. What do you need?",
    ],
    capture_ack: [
      "Got it! I'll hold onto that.",
      "Noted! Tucked away safe.",
      "On it! That's saved.",
    ],
    inbox_nudge: [
      "You've got some thoughts piling up — want to sort through them together?",
    ],
    task_complete: [
      "You did the thing! Tiny victory dance!",
      "Checked off! That feels good, right?",
    ],
    streak_update: [
      "Look at you go! Keep riding that wave!",
    ],
    achievement_unlock: [
      "Whoa, you just unlocked something! Go you!",
    ],
    empty_tasks: [
      "No tasks yet! Want to brain dump some ideas?",
    ],
    empty_routines: [
      "No routines yet! Want me to help you build one?",
    ],
    empty_inbox: [
      "Inbox is clear! Your brain must feel lighter.",
    ],
    sort_offer: [
      "Want me to help sort these out? I'll suggest where things could go.",
    ],
    sort_complete: [
      "All sorted! Take a look and tweak anything that doesn't feel right.",
    ],
    error_generic: [
      "Oops, something hiccuped. Try again?",
    ],
  },
  turtle: {
    greeting_morning: [
      "Good morning. Take a breath. What matters today?",
      "A new day. No rush — let it unfold.",
    ],
    greeting_afternoon: [
      "The day is moving. How are you moving with it?",
      "Afternoon. A good time to check in with yourself.",
    ],
    greeting_evening: [
      "Evening. You've carried enough today. Set it down.",
      "The day is winding down. What went well?",
    ],
    greeting_return_short: [
      "Welcome back. Time away is not time wasted.",
      "Good to see you again. Pick up wherever feels right.",
    ],
    greeting_return_long: [
      "It's been a while. That's perfectly okay. The path is still here whenever you're ready.",
      "No rush. You're here now, and that's what matters. Want to start fresh?",
    ],
    capture_ack: [
      "Held.",
      "I'll remember that.",
      "Noted. It'll be here when you need it.",
    ],
    inbox_nudge: [
      "You have some thoughts saved up. When the time feels right, we can look through them.",
    ],
    task_complete: [
      "Done. Sometimes the smallest step is the bravest one.",
      "Completed. That took courage, even if it didn't feel like it.",
    ],
    streak_update: [
      "Consistency is quiet strength. You're building it.",
    ],
    achievement_unlock: [
      "A milestone. Take a moment to appreciate the journey here.",
    ],
    empty_tasks: [
      "Nothing on the list. Perhaps that's its own kind of peace.",
    ],
    empty_routines: [
      "No routines yet. When you're ready, we'll build something gentle.",
    ],
    empty_inbox: [
      "A clear mind. Enjoy the space.",
    ],
    sort_offer: [
      "Would you like help organizing these thoughts? No pressure.",
    ],
    sort_complete: [
      "Organized. Review at your own pace.",
    ],
    error_generic: [
      "Something didn't work. Let's try again, gently.",
    ],
  },
  seal: {
    greeting_morning: [
      "Morning! Just showing up is a win. How are you?",
      "Hey, good morning. You're doing great just being here.",
    ],
    greeting_afternoon: [
      "Hey! Hope your afternoon is treating you well.",
      "Checking in — you're doing fine, you know that right?",
    ],
    greeting_evening: [
      "Hey, you made it through today. That counts for a lot.",
      "Evening. Whatever you got done today? That's enough.",
    ],
    greeting_return_short: [
      "Hey, you're back! I'm glad. No judgment, just happy to see you.",
      "Welcome back! Everything's still here. Take your time.",
    ],
    greeting_return_long: [
      "It's been a little while — and that's completely okay. You don't have to explain. Want to start fresh?",
      "Hey, I've been here. No pressure, no catch-up needed. Just glad you're back.",
    ],
    capture_ack: [
      "Got it, friend. Safe with me.",
      "Heard. I'll keep that for you.",
      "Saved! Don't worry about it for now.",
    ],
    inbox_nudge: [
      "You've got some thoughts saved — want to look through them together? Only if you feel like it.",
    ],
    task_complete: [
      "Done! You should be proud of that.",
      "Look at you getting things done. Seriously, well done.",
    ],
    streak_update: [
      "You keep showing up. That's something to feel good about.",
    ],
    achievement_unlock: [
      "You earned this! Take a second to appreciate yourself.",
    ],
    empty_tasks: [
      "Nothing here yet — and that's totally fine. Drop something in when you're ready.",
    ],
    empty_routines: [
      "No routines yet. Want to build one together? No rush.",
    ],
    empty_inbox: [
      "All clear! Nothing hanging over you.",
    ],
    sort_offer: [
      "Want a hand sorting these? I'll do the heavy lifting.",
    ],
    sort_complete: [
      "All sorted! See how that feels.",
    ],
    error_generic: [
      "Hmm, that didn't quite work. No worries, let's try again.",
    ],
  },
  owl: {
    greeting_morning: [
      "Morning.",
      "A new day. Begin when ready.",
    ],
    greeting_afternoon: [
      "Afternoon.",
      "Midday. How goes it?",
    ],
    greeting_evening: [
      "Evening. Rest approaches.",
      "Day's end. Review or rest.",
    ],
    greeting_return_short: [
      "You're back.",
      "Welcome. Pick up where you left off.",
    ],
    greeting_return_long: [
      "It's been a while. No matter. Fresh start available.",
      "Returned. Everything is as you left it.",
    ],
    capture_ack: [
      "Noted.",
      "Recorded.",
      "Stored.",
    ],
    inbox_nudge: [
      "Unprocessed items await your attention.",
    ],
    task_complete: [
      "Done.",
      "Complete. Next?",
    ],
    streak_update: [
      "Consistent. Good.",
    ],
    achievement_unlock: [
      "Achievement unlocked.",
    ],
    empty_tasks: [
      "Empty. Add when ready.",
    ],
    empty_routines: [
      "No routines configured.",
    ],
    empty_inbox: [
      "Inbox clear.",
    ],
    sort_offer: [
      "Sort these?",
    ],
    sort_complete: [
      "Sorted. Review.",
    ],
    error_generic: [
      "Error occurred. Retry.",
    ],
  },
  fox: {
    greeting_morning: [
      "Good morning! What's on your mind today? Let's figure it out together.",
      "Hey, morning! I've got a good feeling about today.",
    ],
    greeting_afternoon: [
      "Afternoon! How's everything going? Need anything?",
      "Hey! Checking in — what can we work on together?",
    ],
    greeting_evening: [
      "Evening! Let's wrap up the day on a good note.",
      "Winding down? Let's see what we accomplished today.",
    ],
    greeting_return_short: [
      "Hey, welcome back! I've been keeping things tidy while you were away.",
      "You're back! Good to see you. What are we working on?",
    ],
    greeting_return_long: [
      "Hey! It's been a little while — no worries at all. Want to start fresh today?",
      "Welcome back, friend! I cleared the cobwebs. Ready when you are.",
    ],
    capture_ack: [
      "Got it! I'll hold onto that for you.",
      "Tucked away! We'll come back to it later.",
      "Captured! One less thing rattling around your brain.",
    ],
    inbox_nudge: [
      "You've got some thoughts saved up — want to look through them together?",
    ],
    task_complete: [
      "Nice — that's done! Feels good, right?",
      "Crossed off! What's next on the adventure?",
    ],
    streak_update: [
      "You're on a roll! Keep it going.",
    ],
    achievement_unlock: [
      "Hey, you just unlocked something! That's worth celebrating.",
    ],
    empty_tasks: [
      "No tasks yet! Tell me what's on your mind and we'll make a plan.",
    ],
    empty_routines: [
      "No routines yet! Want to build one together? I'll help.",
    ],
    empty_inbox: [
      "All clear! Brain's nice and tidy.",
    ],
    sort_offer: [
      "Want me to help sort these? I'll suggest where each one could go.",
    ],
    sort_complete: [
      "All organized! Take a peek and adjust whatever doesn't feel right.",
    ],
    error_generic: [
      "Oops, something went sideways. Let's try that again.",
    ],
  },
  deer: {
    greeting_morning: [
      "Good morning. I hope you slept well.",
      "Morning. Take it easy as you start the day.",
    ],
    greeting_afternoon: [
      "Afternoon. I noticed you're here — that's good.",
      "Hey. How's your energy this afternoon?",
    ],
    greeting_evening: [
      "Evening. You did well today, even if it doesn't feel like it.",
      "The day is settling. So can you.",
    ],
    greeting_return_short: [
      "Hey, it's nice to see you again. How have you been?",
      "Welcome back. I noticed you were away — hope everything's okay.",
    ],
    greeting_return_long: [
      "It's been a while. I thought of you. No pressure — just happy you're here.",
      "You've been gone a bit, and that's okay. Everything's still here, waiting patiently.",
    ],
    capture_ack: [
      "I'll hold that for you.",
      "Gently noted.",
      "Safe with me.",
    ],
    inbox_nudge: [
      "I've noticed some thoughts have been sitting for a bit. Whenever you're ready.",
    ],
    task_complete: [
      "That's done. I see you putting in the effort.",
      "Completed. Every small thing adds up, you know.",
    ],
    streak_update: [
      "I've noticed you've been showing up more. That matters.",
    ],
    achievement_unlock: [
      "You reached something meaningful. I noticed.",
    ],
    empty_tasks: [
      "Nothing here yet. Share what's on your mind when you're ready.",
    ],
    empty_routines: [
      "No routines yet. We can build something gentle whenever you'd like.",
    ],
    empty_inbox: [
      "Everything's sorted. A quiet moment.",
    ],
    sort_offer: [
      "Would you like me to help organize these? I'll be gentle with them.",
    ],
    sort_complete: [
      "All set. Take a look when you're ready.",
    ],
    error_generic: [
      "Something didn't quite work. It's okay — let's try again.",
    ],
  },
  frog: {
    greeting_morning: [
      "Ribbit! Good morning! Let's hop to it... or not. Your call!",
      "Morning! *splash* Sorry, just woke up. What's the plan?",
    ],
    greeting_afternoon: [
      "Afternoon, friend! Lily pad's warm, vibes are good.",
      "Hey! How's the pond treating you today?",
    ],
    greeting_evening: [
      "Evening! Almost time to croak... I mean, relax.",
      "Hey! You survived another day. That deserves a *ribbit* of respect.",
    ],
    greeting_return_short: [
      "You're back! *happy splashing* What'd I miss?",
      "Hey hey! The pond was quiet without you.",
    ],
    greeting_return_long: [
      "Where ya been? Just kidding, I'm not your mom. Glad you're here! Fresh start?",
      "Long time no hop! No worries, I've just been sitting on my lily pad. Ready when you are!",
    ],
    capture_ack: [
      "Yoink! Snagged that thought.",
      "Got it! *tongue snap*",
      "Noted! Filed under 'brain stuff'.",
    ],
    inbox_nudge: [
      "Psst... you've got some thoughts fermenting in here. Wanna poke through them?",
    ],
    task_complete: [
      "DONE! *celebratory ribbit*",
      "Boom! One less thing. High five! ...I have webbed feet but you get the idea.",
    ],
    streak_update: [
      "Hop hop hop — you're on a streak! Don't stop now!",
    ],
    achievement_unlock: [
      "Whoa, achievement unlocked! You're basically a frog prince/princess now.",
    ],
    empty_tasks: [
      "Nothing here! Brain dump some stuff and I'll catch it. *opens mouth wide*",
    ],
    empty_routines: [
      "No routines yet! Want to build one? I promise it won't be boring. ...Probably.",
    ],
    empty_inbox: [
      "Inbox: sparkling clean! *chef's kiss* ...Do frogs kiss? Unclear.",
    ],
    sort_offer: [
      "Want me to sort this mess? I'm surprisingly organized for a frog.",
    ],
    sort_complete: [
      "Sorted! I put everything in neat little lily pads. Take a look!",
    ],
    error_generic: [
      "Whoops! Something croaked. Let's try again.",
    ],
  },
};

export function getCompanionCopy(
  companionType: CompanionType,
  context: CopyContext
): string {
  const messages = copy[companionType]?.[context];
  if (!messages || messages.length === 0) {
    return copy.fox[context]?.[0] ?? "";
  }
  return messages[Math.floor(Math.random() * messages.length)];
}

export type { CopyContext };
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/companions.ts src/lib/companionCopy.ts
git commit -m "add companion roster data and personality copy system"
```

---

### Task 3: API Routes — Inbox CRUD

**Files:**
- Create: `src/app/api/inbox/route.ts`
- Create: `src/app/api/inbox/[id]/route.ts`

- [ ] **Step 1: Create inbox list/create route**

Create `src/app/api/inbox/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const items = await prisma.inboxItem.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const item = await prisma.inboxItem.create({
    data: {
      userId: session.user.id,
      content: body.content.trim(),
      source: body.source === "voice" ? "voice" : "text",
    },
  });

  return NextResponse.json(item, { status: 201 });
}
```

- [ ] **Step 2: Create inbox item update/delete route**

Create `src/app/api/inbox/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowed: Record<string, unknown> = {};
  if (body.status && ["unprocessed", "converted", "dismissed"].includes(body.status)) {
    allowed.status = body.status;
  }
  if (body.convertedTo) allowed.convertedTo = body.convertedTo;
  if (body.convertedId) allowed.convertedId = body.convertedId;

  const updated = await prisma.inboxItem.update({
    where: { id },
    data: allowed,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.inboxItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/inbox/
git commit -m "add inbox CRUD API routes"
```

---

### Task 4: API Routes — AI Sort and Companion Greeting

**Files:**
- Create: `src/app/api/inbox/sort/route.ts`
- Create: `src/app/api/companion/greeting/route.ts`
- Modify: `src/app/api/settings/route.ts`

- [ ] **Step 1: Create AI inbox sort route**

Create `src/app/api/inbox/sort/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inboxItem.findMany({
    where: { userId: session.user.id, status: "unprocessed" },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  if (items.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const itemList = items.map((item, i) => `${i + 1}. "${item.content}"`).join("\n");

  const prompt = `You are helping organize a brain dump for a neurodivergent user. For each item below, suggest what it should become. Be generous and helpful.

Items:
${itemList}

Respond with ONLY a JSON array where each element has:
- "index": the item number (1-based)
- "category": one of "task", "reminder", "routine", or "note"
- "reason": a short friendly explanation (under 15 words)
- "suggestedTitle": a clean, actionable title if it's a task/reminder (or null for notes)

Example: [{"index": 1, "category": "task", "reason": "Sounds like something to check off", "suggestedTitle": "Buy groceries"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }
    const suggestions = JSON.parse(jsonMatch[0]);

    const mapped = suggestions.map((s: { index: number; category: string; reason: string; suggestedTitle: string | null }) => ({
      itemId: items[s.index - 1]?.id,
      category: s.category,
      reason: s.reason,
      suggestedTitle: s.suggestedTitle,
    })).filter((s: { itemId: string | undefined }) => s.itemId);

    return NextResponse.json({ suggestions: mapped });
  } catch {
    return NextResponse.json({ error: "AI sorting failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create companion greeting route**

Create `src/app/api/companion/greeting/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getCompanionCopy } from "@/lib/companionCopy";
import type { CompanionType } from "@/lib/companions";
import type { CopyContext } from "@/lib/companionCopy";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  const companionType = (settings?.companionType ?? "fox") as CompanionType;

  // Determine time of day
  const hour = new Date().getHours();
  let timeContext: CopyContext;
  if (hour < 12) timeContext = "greeting_morning";
  else if (hour < 17) timeContext = "greeting_afternoon";
  else timeContext = "greeting_evening";

  // Check days since last activity
  const lastActivity = await prisma.inboxItem.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  let gapContext: CopyContext | null = null;
  if (lastActivity) {
    const daysSince = Math.floor(
      (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 8) gapContext = "greeting_return_long";
    else if (daysSince >= 4) gapContext = "greeting_return_short";
  }

  // Also check last task/wellness/routine activity for gap
  if (!gapContext && !lastActivity) {
    const lastTask = await prisma.task.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (lastTask) {
      const daysSince = Math.floor(
        (Date.now() - lastTask.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 8) gapContext = "greeting_return_long";
      else if (daysSince >= 4) gapContext = "greeting_return_short";
    }
  }

  const context = gapContext ?? timeContext;
  const greeting = getCompanionCopy(companionType, context);

  // Count unprocessed inbox items for nudge
  const unprocessedCount = await prisma.inboxItem.count({
    where: { userId: session.user.id, status: "unprocessed" },
  });

  return NextResponse.json({
    greeting,
    companionType,
    unprocessedCount,
  });
}
```

- [ ] **Step 3: Add companionType to settings PATCH whitelist**

In `src/app/api/settings/route.ts`, find the allowed fields object in the PATCH handler and add `companionType`:

Add `companionType` to the list of allowed fields that can be set via PATCH, with validation that it's one of the 7 valid companion types:
```typescript
if (body.companionType && ["otter", "turtle", "seal", "owl", "fox", "deer", "frog"].includes(body.companionType)) {
  allowed.companionType = body.companionType;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/inbox/sort/ src/app/api/companion/ src/app/api/settings/route.ts
git commit -m "add AI inbox sort, companion greeting, and companionType setting"
```

---

### Task 5: Components — CompanionAvatar and CompanionPicker

**Files:**
- Create: `src/components/companion/CompanionAvatar.tsx`
- Create: `src/components/companion/CompanionPicker.tsx`

- [ ] **Step 1: Create CompanionAvatar component**

Create `src/components/companion/CompanionAvatar.tsx`:
```tsx
"use client";

import { getCompanion, type CompanionType } from "@/lib/companions";

interface CompanionAvatarProps {
  type: CompanionType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-20 h-20 text-4xl",
};

export default function CompanionAvatar({ type, size = "md", className = "" }: CompanionAvatarProps) {
  const companion = getCompanion(type);

  return (
    <div
      className={`${sizes[size]} rounded-full bg-cove-accent/10 flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label={`${companion.name} companion`}
    >
      {companion.emoji}
    </div>
  );
}
```

- [ ] **Step 2: Create CompanionPicker component**

Create `src/components/companion/CompanionPicker.tsx`:
```tsx
"use client";

import { COMPANIONS, type CompanionType } from "@/lib/companions";
import CompanionAvatar from "./CompanionAvatar";

interface CompanionPickerProps {
  selected: CompanionType;
  onSelect: (type: CompanionType) => void;
}

export default function CompanionPicker({ selected, onSelect }: CompanionPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {COMPANIONS.map((companion) => {
        const isSelected = companion.type === selected;
        return (
          <button
            key={companion.type}
            onClick={() => onSelect(companion.type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-cove-accent bg-cove-accent/5"
                : "border-transparent bg-cove-card hover:border-cove-accent/30"
            }`}
          >
            <CompanionAvatar type={companion.type} size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold text-cove-charcoal">{companion.name}</p>
              <p className="text-xs text-cove-muted">{companion.personality}</p>
            </div>
            <p className="text-xs text-cove-muted/70 italic text-center leading-snug">
              &ldquo;{companion.sampleQuote}&rdquo;
            </p>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/companion/CompanionAvatar.tsx src/components/companion/CompanionPicker.tsx
git commit -m "add CompanionAvatar and CompanionPicker components"
```

---

### Task 6: Components — VoiceInput and QuickCapture

**Files:**
- Create: `src/components/companion/VoiceInput.tsx`
- Create: `src/components/companion/QuickCapture.tsx`

- [ ] **Step 1: Create VoiceInput component**

Create `src/components/companion/VoiceInput.tsx`:
```tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onTranscript]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`p-2 rounded-full transition-all ${
        isListening
          ? "bg-red-500/20 text-red-500 animate-pulse"
          : "text-cove-muted hover:text-cove-charcoal hover:bg-cove-accent/10"
      }`}
      aria-label={isListening ? "Stop recording" : "Start voice input"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Create QuickCapture FAB component**

Create `src/components/companion/QuickCapture.tsx`:
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanionAvatar from "./CompanionAvatar";
import VoiceInput from "./VoiceInput";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface QuickCaptureProps {
  companionType: CompanionType;
}

export default function QuickCapture({ companionType }: QuickCaptureProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [ack, setAck] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = async () => {
    const content = value.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, source: "text" }),
      });
      if (res.ok) {
        setValue("");
        const msg = getCompanionCopy(companionType, "capture_ack");
        setAck(msg);
        setTimeout(() => {
          setAck(null);
          setOpen(false);
        }, 1500);
      }
    } finally {
      setSending(false);
    }
  };

  const handleVoice = async (transcript: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: transcript, source: "voice" }),
      });
      if (res.ok) {
        const msg = getCompanionCopy(companionType, "capture_ack");
        setAck(msg);
        setTimeout(() => {
          setAck(null);
          setOpen(false);
        }, 1500);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-cove-accent text-white shadow-lg hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 flex items-center justify-center"
        aria-label="Quick capture"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-cove-bg rounded-t-2xl p-4 pb-8 shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {ack ? (
                <div className="flex items-center gap-3 py-4 justify-center">
                  <CompanionAvatar type={companionType} size="sm" />
                  <p className="text-sm text-cove-charcoal">{ack}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CompanionAvatar type={companionType} size="sm" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="What's on your mind?"
                    className="flex-1 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
                    disabled={sending}
                  />
                  <VoiceInput onTranscript={handleVoice} disabled={sending} />
                  <button
                    onClick={submit}
                    disabled={!value.trim() || sending}
                    className="p-2.5 rounded-xl bg-cove-accent text-white disabled:opacity-40 transition-opacity"
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/companion/VoiceInput.tsx src/components/companion/QuickCapture.tsx
git commit -m "add VoiceInput and QuickCapture FAB components"
```

---

### Task 7: Components — CompanionScreen (Main Chat Interface)

**Files:**
- Create: `src/components/companion/CompanionMessage.tsx`
- Create: `src/components/companion/InboxList.tsx`
- Create: `src/components/companion/InboxSorter.tsx`
- Create: `src/components/companion/CompanionScreen.tsx`

- [ ] **Step 1: Create CompanionMessage bubble**

Create `src/components/companion/CompanionMessage.tsx`:
```tsx
"use client";

import CompanionAvatar from "./CompanionAvatar";
import type { CompanionType } from "@/lib/companions";

interface CompanionMessageProps {
  content: string;
  sender: "companion" | "user";
  companionType: CompanionType;
  source?: "text" | "voice";
  timestamp?: Date;
}

export default function CompanionMessage({ content, sender, companionType, source, timestamp }: CompanionMessageProps) {
  const isCompanion = sender === "companion";

  return (
    <div className={`flex gap-2.5 ${isCompanion ? "items-start" : "items-start flex-row-reverse"}`}>
      {isCompanion && <CompanionAvatar type={companionType} size="sm" />}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isCompanion
            ? "bg-cove-card text-cove-charcoal rounded-tl-md"
            : "bg-cove-accent/15 text-cove-charcoal rounded-tr-md"
        }`}
      >
        {source === "voice" && (
          <span className="text-xs text-cove-muted mr-1.5" aria-label="Voice message">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            </svg>
          </span>
        )}
        {content}
        {timestamp && (
          <span className="block text-[10px] text-cove-muted/50 mt-1">
            {timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create InboxList component**

Create `src/components/companion/InboxList.tsx`:
```tsx
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
                <span className="text-[10px] text-cove-muted bg-cove-accent/5 px-1.5 py-0.5 rounded">voice</span>
              )}
              <span className="text-[10px] text-cove-muted">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
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
```

- [ ] **Step 3: Create InboxSorter component**

Create `src/components/companion/InboxSorter.tsx`:
```tsx
"use client";

import { useState } from "react";
import CompanionAvatar from "./CompanionAvatar";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface Suggestion {
  itemId: string;
  category: string;
  reason: string;
  suggestedTitle: string | null;
}

interface InboxSorterProps {
  companionType: CompanionType;
  onSortComplete: () => void;
}

export default function InboxSorter({ companionType, onSortComplete }: InboxSorterProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox/sort", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion: Suggestion) => {
    const { itemId, category, suggestedTitle } = suggestion;

    if (category === "task" && suggestedTitle) {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestedTitle }),
      });
      if (res.ok) {
        const task = await res.json();
        await fetch(`/api/inbox/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "converted", convertedTo: "task", convertedId: task.id }),
        });
      }
    } else if (category === "reminder" && suggestedTitle) {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestedTitle, type: "custom" }),
      });
      if (res.ok) {
        const reminder = await res.json();
        await fetch(`/api/inbox/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "converted", convertedTo: "reminder", convertedId: reminder.id }),
        });
      }
    } else {
      await fetch(`/api/inbox/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "converted", convertedTo: category }),
      });
    }

    setApplied((prev) => new Set(prev).add(itemId));
  };

  const allApplied = suggestions.length > 0 && suggestions.every((s) => applied.has(s.itemId));

  if (suggestions.length === 0) {
    return (
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cove-accent/10 text-cove-accent text-sm hover:bg-cove-accent/20 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="animate-pulse">Thinking...</span>
        ) : (
          <>
            <span>Help me sort</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CompanionAvatar type={companionType} size="sm" />
        <p className="text-sm text-cove-charcoal">
          {allApplied
            ? getCompanionCopy(companionType, "sort_complete")
            : getCompanionCopy(companionType, "sort_offer")}
        </p>
      </div>
      {suggestions.map((s) => {
        const isApplied = applied.has(s.itemId);
        return (
          <div
            key={s.itemId}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isApplied ? "border-cove-accent/20 bg-cove-accent/5 opacity-60" : "border-cove-accent/10 bg-cove-card"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cove-charcoal">
                {s.suggestedTitle ?? "(note)"}
              </p>
              <p className="text-xs text-cove-muted">{s.reason}</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-cove-accent/10 text-cove-accent shrink-0">
              {s.category}
            </span>
            {!isApplied && (
              <button
                onClick={() => applySuggestion(s)}
                className="text-xs px-3 py-1.5 rounded-lg bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors shrink-0"
              >
                Apply
              </button>
            )}
            {isApplied && (
              <span className="text-xs text-cove-accent shrink-0">Done</span>
            )}
          </div>
        );
      })}
      {allApplied && (
        <button
          onClick={onSortComplete}
          className="text-sm text-cove-accent hover:underline"
        >
          Back to chat
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create CompanionScreen main component**

Create `src/components/companion/CompanionScreen.tsx`:
```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CompanionAvatar from "./CompanionAvatar";
import CompanionMessage from "./CompanionMessage";
import VoiceInput from "./VoiceInput";
import InboxList from "./InboxList";
import InboxSorter from "./InboxSorter";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface ChatMessage {
  id: string;
  content: string;
  sender: "companion" | "user";
  source?: "text" | "voice";
  timestamp: Date;
}

interface InboxItemData {
  id: string;
  content: string;
  source: string;
  status: string;
  convertedTo: string | null;
  createdAt: string;
}

export default function CompanionScreen() {
  const [companionType, setCompanionType] = useState<CompanionType>("fox");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItemData[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSorter, setShowSorter] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load greeting and inbox on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [greetingRes, inboxRes, settingsRes] = await Promise.all([
          fetch("/api/companion/greeting"),
          fetch("/api/inbox?status=unprocessed"),
          fetch("/api/settings"),
        ]);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.companionType) setCompanionType(settings.companionType);
        }

        if (greetingRes.ok) {
          const { greeting, companionType: ct } = await greetingRes.json();
          if (ct) setCompanionType(ct);
          setMessages([{
            id: "greeting",
            content: greeting,
            sender: "companion",
            timestamp: new Date(),
          }]);
        }

        if (inboxRes.ok) {
          setInboxItems(await inboxRes.json());
        }
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = useCallback(async (content: string, source: "text" | "voice" = "text") => {
    if (!content.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: "user",
      source,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), source }),
      });

      if (res.ok) {
        const item = await res.json();
        setInboxItems((prev) => [item, ...prev]);

        const ack = getCompanionCopy(companionType, "capture_ack");
        setMessages((prev) => [...prev, {
          id: `companion-${Date.now()}`,
          content: ack,
          sender: "companion",
          timestamp: new Date(),
        }]);
      }
    } finally {
      setSending(false);
    }
  }, [sending, companionType]);

  const handleConvert = async (id: string, to: "task" | "reminder") => {
    const item = inboxItems.find((i) => i.id === id);
    if (!item) return;

    if (to === "task") {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.content }),
      });
      if (res.ok) {
        const task = await res.json();
        await fetch(`/api/inbox/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "converted", convertedTo: "task", convertedId: task.id }),
        });
        setInboxItems((prev) => prev.filter((i) => i.id !== id));
      }
    } else if (to === "reminder") {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.content, type: "custom" }),
      });
      if (res.ok) {
        const reminder = await res.json();
        await fetch(`/api/inbox/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "converted", convertedTo: "reminder", convertedId: reminder.id }),
        });
        setInboxItems((prev) => prev.filter((i) => i.id !== id));
      }
    }
  };

  const handleDismiss = async (id: string) => {
    await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    setInboxItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSortComplete = async () => {
    setShowSorter(false);
    const res = await fetch("/api/inbox?status=unprocessed");
    if (res.ok) setInboxItems(await res.json());
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <CompanionAvatar type={companionType} size="lg" className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cove-accent/10">
        <CompanionAvatar type={companionType} size="md" />
        <div>
          <p className="text-sm font-semibold text-cove-charcoal capitalize">{companionType}</p>
          <p className="text-xs text-cove-muted">Your companion</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <CompanionMessage
            key={msg.id}
            content={msg.content}
            sender={msg.sender}
            companionType={companionType}
            source={msg.source}
            timestamp={msg.timestamp}
          />
        ))}

        {/* Inbox section */}
        {inboxItems.length > 0 && !showSorter && (
          <div className="pt-4 space-y-3">
            <InboxList
              items={inboxItems}
              onConvert={handleConvert}
              onDismiss={handleDismiss}
            />
            <InboxSorter
              companionType={companionType}
              onSortComplete={handleSortComplete}
            />
          </div>
        )}

        {showSorter && (
          <div className="pt-4">
            <InboxSorter
              companionType={companionType}
              onSortComplete={handleSortComplete}
            />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-cove-accent/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="What's on your mind?"
            className="flex-1 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
            disabled={sending}
          />
          <VoiceInput onTranscript={(t) => sendMessage(t, "voice")} disabled={sending} />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-cove-accent text-white disabled:opacity-40 transition-opacity"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/companion/CompanionMessage.tsx src/components/companion/InboxList.tsx src/components/companion/InboxSorter.tsx src/components/companion/CompanionScreen.tsx
git commit -m "add CompanionScreen with chat interface, inbox list, and AI sorter"
```

---

### Task 8: Integration — Dashboard Tab, Onboarding, Settings

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/onboarding/OnboardingWizard.tsx`
- Modify: `src/components/settings/SettingsPanel.tsx`

- [ ] **Step 1: Add companion tab to dashboard**

In `src/app/dashboard/page.tsx`:

Add import at top:
```typescript
import CompanionScreen from "@/components/companion/CompanionScreen";
import QuickCapture from "@/components/companion/QuickCapture";
```

Add companion icon to the `icons` object:
```typescript
companion: (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
),
```

Add companion as the **first** nav item in the `navItems` array:
```typescript
{ id: "companion", label: "Companion", icon: icons.companion },
```

Change the default `activeItem` state from `"daily-view"` to `"companion"`.

In `defaultModuleStates`, ensure companion is not togglable (it's always on like daily-view). No entry needed since `isModuleEnabled` already returns true for items not in `moduleStates`.

Add the companion screen render and QuickCapture FAB inside the return, in the content area:
```tsx
{activeItem === "companion" && <CompanionScreen />}
```

Add QuickCapture after `<GuidedTour>` but before the content div, passing companionType (use "fox" as default — the CompanionScreen manages its own state, and QuickCapture needs it from settings):

Add a `companionType` state to the page component, loaded from settings alongside modules:
```typescript
const [companionType, setCompanionType] = useState<CompanionType>("fox");
```

In the existing settings/modules fetch effect, also fetch settings to get companionType:
```typescript
fetch("/api/settings").then(res => res.ok ? res.json() : null).then(settings => {
  if (settings?.companionType) setCompanionType(settings.companionType);
}).catch(() => {});
```

Add QuickCapture (only show when not on companion tab):
```tsx
{activeItem !== "companion" && <QuickCapture companionType={companionType} />}
```

- [ ] **Step 2: Add companion selection to onboarding**

In `src/components/onboarding/OnboardingWizard.tsx`:

Add imports:
```typescript
import CompanionPicker from "@/components/companion/CompanionPicker";
import type { CompanionType } from "@/lib/companions";
```

Add state:
```typescript
const [companionType, setCompanionType] = useState<CompanionType>("fox");
```

Change the wizard from 5 steps (0-4) to 6 steps (0-5). Insert companion selection as step 2 (after profile, before modules). Shift modules to step 3, theme to step 4, done to step 5.

Add the companion step JSX (when `step === 2`):
```tsx
<div data-testid="companion-step">
  <h2 className="text-xl font-semibold text-cove-charcoal mb-2">Choose your companion</h2>
  <p className="text-sm text-cove-muted mb-6">
    Your companion will be your guide through cove. Pick the personality that feels right for you.
  </p>
  <CompanionPicker selected={companionType} onSelect={setCompanionType} />
</div>
```

In `handleComplete`, add companionType to the settings PATCH body:
```typescript
body: JSON.stringify({ theme, density, animationsOn, companionType }),
```

- [ ] **Step 3: Add companion switcher to settings**

In `src/components/settings/SettingsPanel.tsx`:

Add imports:
```typescript
import CompanionPicker from "@/components/companion/CompanionPicker";
import type { CompanionType } from "@/lib/companions";
```

Add a "Companion" section to the settings panel. Add state for `companionType`, load it from the settings fetch, and save on change:

```tsx
<div className="space-y-3">
  <h3 className="text-sm font-semibold text-cove-charcoal">Companion</h3>
  <CompanionPicker
    selected={companionType}
    onSelect={(type) => {
      setCompanionType(type);
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionType: type }),
      });
    }}
  />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/onboarding/OnboardingWizard.tsx src/components/settings/SettingsPanel.tsx
git commit -m "integrate companion tab, onboarding step, and settings switcher"
```

---

### Task 9: Add SpeechRecognition Type Declarations

**Files:**
- Create: `src/types/speech-recognition.d.ts`

- [ ] **Step 1: Add Web Speech API types**

Create `src/types/speech-recognition.d.ts`:
```typescript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/speech-recognition.d.ts
git commit -m "add Web Speech API type declarations"
```

---

### Task 10: Verify and Test

- [ ] **Step 1: Run dev server and verify no build errors**

Run: `npm run dev`
Expected: Compiles without errors

- [ ] **Step 2: Verify migration is applied**

Run: `npx prisma migrate status`
Expected: All migrations applied

- [ ] **Step 3: Manual smoke test**

Open `http://localhost:3000/dashboard` and verify:
1. Companion tab appears first in nav and is default landing
2. Companion greeting loads with fox personality
3. Can type a brain dump message and see it in chat
4. Companion responds with an acknowledgment
5. Inbox items appear with convert/dismiss buttons
6. Quick capture FAB appears on other tabs
7. Voice input button appears (in Chrome/Safari)
8. Settings page shows companion picker
9. Switching companion updates the personality

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix integration issues from smoke test"
```
