# Community Vents & Sharing — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add vents/rants section to Community, community sub-tabs, top-level share button on Routines, avatar system with starter set, and display name regeneration.

**Architecture:** New Prisma models for Vent, VentComment, VentReport, CommunityAvatar. New API routes under `/api/community/vents`. Community tab splits into sub-tabs (Routines | Vents). Routines tab gets a top-level "Share to Community" button with routine picker. Avatar assigned on first community interaction.

**Tech Stack:** Next.js 16, React 19, Prisma, NextAuth, Tailwind CSS v4, Vitest + Testing Library

---

## File Structure

### New files
- `prisma/migrations/XXXXXXX_add_vents_and_avatars/migration.sql` (auto-generated)
- `src/app/api/community/vents/route.ts` — list + create vents
- `src/app/api/community/vents/[id]/route.ts` — delete own vent
- `src/app/api/community/vents/[id]/comments/route.ts` — list + create comments
- `src/app/api/community/vents/[id]/report/route.ts` — report a vent
- `src/app/api/user/display-name/regenerate/route.ts` — generate new random name
- `src/app/api/user/avatar/route.ts` — get/change avatar
- `src/components/community/CommunityTabs.tsx` — Routines | Vents sub-nav + messages icon placeholder
- `src/components/community/VentFeed.tsx` — vent list with pagination
- `src/components/community/VentCard.tsx` — single vent display
- `src/components/community/VentComposer.tsx` — create vent form
- `src/components/community/VentComments.tsx` — comment list + input
- `src/components/community/ProfileCard.tsx` — mini profile popup
- `src/components/community/AvatarDisplay.tsx` — renders avatar icon by key
- `src/components/community/RoutineSharePicker.tsx` — routine picker modal for top-level share
- `src/components/community/VentFeed.test.tsx` — tests for vent feed
- `src/components/community/VentComposer.test.tsx` — tests for vent composer
- `src/components/community/CommunityTabs.test.tsx` — tests for tab switching
- `src/lib/avatars.ts` — avatar definitions (starter set, keys, SVG paths or emoji)
- `src/lib/randomName.ts` — extract generateRandomName to shared utility
- `prisma/seed-avatars.ts` — seed avatar reference data

### Modified files
- `prisma/schema.prisma` — add Vent, VentComment, VentReport, CommunityAvatar models; add avatarKey to User
- `src/components/community/CommunityBrowser.tsx` — remove outer heading (CommunityTabs handles it)
- `src/components/community/PublishRoutineForm.tsx` — import randomName from shared lib
- `src/components/routines/RoutineList.tsx` — add top-level "Share to Community" button
- `src/app/dashboard/page.tsx` — replace CommunityBrowser with CommunityTabs

---

### Task 1: Prisma Schema — Add Vent Models and Avatar Field

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add models to schema**

Add the following to the end of `prisma/schema.prisma`:

```prisma
model CommunityAvatar {
  id              String @id @default(cuid())
  key             String @unique
  label           String
  category        String @default("starter")
  unlockType      String @default("default")
  unlockThreshold Int?
}

model Vent {
  id                String   @id @default(cuid())
  authorId          String
  body              String
  lifespan          String
  expiresAt         DateTime
  contactPreference String   @default("both")
  reportCount       Int      @default(0)
  hidden            Boolean  @default(false)
  createdAt         DateTime @default(now())

  author   User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments VentComment[]
  reports  VentReport[]

  @@index([expiresAt])
  @@index([authorId])
}

model VentComment {
  id        String   @id @default(cuid())
  ventId    String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  vent   Vent @relation(fields: [ventId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([ventId])
}

model VentReport {
  id        String   @id @default(cuid())
  ventId    String
  userId    String
  reason    String
  createdAt DateTime @default(now())

  vent Vent @relation(fields: [ventId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, ventId])
}
```

- [ ] **Step 2: Add relations to User model**

In the `User` model, add these relation fields after `inboxItems`:

```prisma
  vents               Vent[]
  ventComments        VentComment[]
  ventReports         VentReport[]
  avatarKey           String?
```

- [ ] **Step 3: Generate and apply migration**

Run:
```bash
cd /Users/EmmaBB/cove && npx prisma migrate dev --name add_vents_and_avatars
```

Expected: Migration created and applied successfully. Prisma Client regenerated.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "Add Vent, VentComment, VentReport, CommunityAvatar models to schema"
```

---

### Task 2: Shared Utilities — Random Name and Avatars

**Files:**
- Create: `src/lib/randomName.ts`
- Create: `src/lib/avatars.ts`
- Modify: `src/components/community/PublishRoutineForm.tsx`

- [ ] **Step 1: Create randomName utility**

Create `src/lib/randomName.ts`:

```typescript
const adjectives = [
  "calm", "quiet", "gentle", "warm", "bright", "soft", "kind", "steady",
  "clear", "still", "misty", "bold", "swift", "wild", "deep", "light",
  "crisp", "cozy", "dusk", "dawn",
];

const nouns = [
  "river", "fern", "stone", "cloud", "leaf", "moon", "meadow", "ridge",
  "brook", "pine", "coral", "ember", "moss", "cliff", "wave", "spark",
  "bloom", "frost", "sage", "dune",
];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}_${noun}_${num}`;
}
```

- [ ] **Step 2: Create avatars definition**

Create `src/lib/avatars.ts`:

```typescript
export interface AvatarDef {
  key: string;
  label: string;
  emoji: string;
  category: "starter" | "nature" | "space" | "rare" | "legendary";
  unlockType: "default" | "xp" | "achievement";
  unlockThreshold?: number;
}

export const AVATARS: AvatarDef[] = [
  // Starter set (available to all)
  { key: "fox", label: "Fox", emoji: "\u{1F98A}", category: "starter", unlockType: "default" },
  { key: "owl", label: "Owl", emoji: "\u{1F989}", category: "starter", unlockType: "default" },
  { key: "rabbit", label: "Rabbit", emoji: "\u{1F430}", category: "starter", unlockType: "default" },
  { key: "bear", label: "Bear", emoji: "\u{1F43B}", category: "starter", unlockType: "default" },
  { key: "cat", label: "Cat", emoji: "\u{1F431}", category: "starter", unlockType: "default" },
  { key: "dog", label: "Dog", emoji: "\u{1F436}", category: "starter", unlockType: "default" },
  { key: "deer", label: "Deer", emoji: "\u{1F98C}", category: "starter", unlockType: "default" },
  { key: "penguin", label: "Penguin", emoji: "\u{1F427}", category: "starter", unlockType: "default" },
  { key: "butterfly", label: "Butterfly", emoji: "\u{1F98B}", category: "starter", unlockType: "default" },
  { key: "turtle", label: "Turtle", emoji: "\u{1F422}", category: "starter", unlockType: "default" },
  { key: "whale", label: "Whale", emoji: "\u{1F433}", category: "starter", unlockType: "default" },
  { key: "octopus", label: "Octopus", emoji: "\u{1F419}", category: "starter", unlockType: "default" },
  { key: "mushroom", label: "Mushroom", emoji: "\u{1F344}", category: "starter", unlockType: "default" },
  { key: "cactus", label: "Cactus", emoji: "\u{1F335}", category: "starter", unlockType: "default" },
  { key: "sunflower", label: "Sunflower", emoji: "\u{1F33B}", category: "starter", unlockType: "default" },
  { key: "leaf", label: "Leaf", emoji: "\u{1F343}", category: "starter", unlockType: "default" },
  { key: "star", label: "Star", emoji: "\u2B50", category: "starter", unlockType: "default" },
  { key: "cloud", label: "Cloud", emoji: "\u2601\uFE0F", category: "starter", unlockType: "default" },
  { key: "rainbow", label: "Rainbow", emoji: "\u{1F308}", category: "starter", unlockType: "default" },
  { key: "moon", label: "Moon", emoji: "\u{1F319}", category: "starter", unlockType: "default" },
  // Nature pack (100 XP)
  { key: "cherry_blossom", label: "Cherry Blossom", emoji: "\u{1F338}", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "herb", label: "Herb", emoji: "\u{1F33F}", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "seedling", label: "Seedling", emoji: "\u{1F331}", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "rose", label: "Rose", emoji: "\u{1F339}", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "hibiscus", label: "Hibiscus", emoji: "\u{1F33A}", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  // Space pack (500 XP)
  { key: "rocket", label: "Rocket", emoji: "\u{1F680}", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "saturn", label: "Saturn", emoji: "\u{1FA90}", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "comet", label: "Comet", emoji: "\u2604\uFE0F", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "alien", label: "Alien", emoji: "\u{1F47E}", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "ufo", label: "UFO", emoji: "\u{1F6F8}", category: "space", unlockType: "xp", unlockThreshold: 500 },
];

export const STARTER_AVATARS = AVATARS.filter((a) => a.category === "starter");

export function getAvatarByKey(key: string): AvatarDef | undefined {
  return AVATARS.find((a) => a.key === key);
}

export function getRandomStarterKey(): string {
  const idx = Math.floor(Math.random() * STARTER_AVATARS.length);
  return STARTER_AVATARS[idx].key;
}
```

- [ ] **Step 3: Update PublishRoutineForm to use shared utility**

In `src/components/community/PublishRoutineForm.tsx`, replace the local `generateRandomName` function:

Remove lines 25-31 (the `generateRandomName` function definition).

Add at the top imports:
```typescript
import { generateRandomName } from "@/lib/randomName";
```

- [ ] **Step 4: Verify existing tests still pass**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run
```

Expected: All existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/randomName.ts src/lib/avatars.ts src/components/community/PublishRoutineForm.tsx
git commit -m "Extract randomName to shared utility and add avatar definitions"
```

---

### Task 3: Vents API — List and Create

**Files:**
- Create: `src/app/api/community/vents/route.ts`

- [ ] **Step 1: Create the vents route**

Create `src/app/api/community/vents/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateRandomName } from "@/lib/randomName";
import { getRandomStarterKey } from "@/lib/avatars";

const LIFESPAN_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "48h": 48 * 60 * 60 * 1000,
  "5d": 5 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const now = new Date();

  const [vents, total] = await Promise.all([
    prisma.vent.findMany({
      where: { hidden: false, expiresAt: { gt: now } },
      include: {
        author: { select: { displayName: true, avatarKey: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vent.count({ where: { hidden: false, expiresAt: { gt: now } } }),
  ]);

  const result = vents.map((v) => ({
    id: v.id,
    body: v.body,
    lifespan: v.lifespan,
    expiresAt: v.expiresAt.toISOString(),
    contactPreference: v.contactPreference,
    createdAt: v.createdAt.toISOString(),
    displayName: v.author.displayName,
    avatarKey: v.author.avatarKey,
    commentCount: v._count.comments,
    isOwn: v.authorId === session.user.id,
  }));

  return NextResponse.json({ vents: result, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Vent text is required" }, { status: 400 });
  }

  if (body.body.trim().length > 2000) {
    return NextResponse.json({ error: "Vent must be 2000 characters or less" }, { status: 400 });
  }

  const lifespan = body.lifespan as string;
  if (!LIFESPAN_MS[lifespan]) {
    return NextResponse.json({ error: "Invalid lifespan. Use: 24h, 48h, 5d, or 7d" }, { status: 400 });
  }

  const contactPreference = body.contactPreference ?? "both";
  if (!["dms", "anonymous_replies", "both"].includes(contactPreference)) {
    return NextResponse.json({ error: "Invalid contact preference" }, { status: 400 });
  }

  // Ensure user has a display name and avatar
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, avatarKey: true },
  });

  if (!user?.displayName) {
    const newName = generateRandomName();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: newName },
    });
  }

  if (!user?.avatarKey) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarKey: getRandomStarterKey() },
    });
  }

  const expiresAt = new Date(Date.now() + LIFESPAN_MS[lifespan]);

  const vent = await prisma.vent.create({
    data: {
      authorId: session.user.id,
      body: body.body.trim(),
      lifespan,
      expiresAt,
      contactPreference,
    },
  });

  return NextResponse.json(vent, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/community/vents/route.ts
git commit -m "Add vents API: list non-expired vents and create new vents"
```

---

### Task 4: Vents API — Delete and Report

**Files:**
- Create: `src/app/api/community/vents/[id]/route.ts`
- Create: `src/app/api/community/vents/[id]/report/route.ts`

- [ ] **Step 1: Create delete route**

Create `src/app/api/community/vents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const vent = await prisma.vent.findUnique({ where: { id } });
  if (!vent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (vent.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.vent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create report route**

Create `src/app/api/community/vents/[id]/report/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const HIDE_THRESHOLD = 3;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.reason || typeof body.reason !== "string" || !body.reason.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const vent = await prisma.vent.findUnique({ where: { id } });
  if (!vent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check for duplicate report
  const existing = await prisma.ventReport.findUnique({
    where: { userId_ventId: { userId: session.user.id, ventId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already reported" }, { status: 409 });
  }

  await prisma.ventReport.create({
    data: {
      ventId: id,
      userId: session.user.id,
      reason: body.reason.trim(),
    },
  });

  // Increment report count and auto-hide if threshold reached
  const updated = await prisma.vent.update({
    where: { id },
    data: { reportCount: { increment: 1 } },
  });

  if (updated.reportCount >= HIDE_THRESHOLD) {
    await prisma.vent.update({ where: { id }, data: { hidden: true } });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/community/vents/\[id\]/
git commit -m "Add vent delete (own only) and report with auto-hide at 3 reports"
```

---

### Task 5: Vent Comments API

**Files:**
- Create: `src/app/api/community/vents/[id]/comments/route.ts`

- [ ] **Step 1: Create comments route**

Create `src/app/api/community/vents/[id]/comments/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const comments = await prisma.ventComment.findMany({
    where: { ventId: id },
    include: {
      author: { select: { displayName: true, avatarKey: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = comments.map((c) => ({
    id: c.id,
    body: c.body,
    displayName: c.author.displayName,
    avatarKey: c.author.avatarKey,
    createdAt: c.createdAt.toISOString(),
    isOwn: c.authorId === session.user.id,
  }));

  return NextResponse.json(result);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }

  if (body.body.trim().length > 500) {
    return NextResponse.json({ error: "Comment must be 500 characters or less" }, { status: 400 });
  }

  // Verify vent exists and is not expired
  const vent = await prisma.vent.findUnique({ where: { id } });
  if (!vent || vent.expiresAt < new Date() || vent.hidden) {
    return NextResponse.json({ error: "Vent not found or expired" }, { status: 404 });
  }

  const comment = await prisma.ventComment.create({
    data: {
      ventId: id,
      authorId: session.user.id,
      body: body.body.trim(),
    },
    include: {
      author: { select: { displayName: true, avatarKey: true } },
    },
  });

  return NextResponse.json({
    id: comment.id,
    body: comment.body,
    displayName: comment.author.displayName,
    avatarKey: comment.author.avatarKey,
    createdAt: comment.createdAt.toISOString(),
    isOwn: true,
  }, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/community/vents/\[id\]/comments/
git commit -m "Add vent comments API: list and create comments"
```

---

### Task 6: Avatar and Display Name Regeneration APIs

**Files:**
- Create: `src/app/api/user/display-name/regenerate/route.ts`
- Create: `src/app/api/user/avatar/route.ts`

- [ ] **Step 1: Create display name regeneration route**

Create `src/app/api/user/display-name/regenerate/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateRandomName } from "@/lib/randomName";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newName = generateRandomName();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: newName },
  });

  return NextResponse.json({ displayName: newName });
}
```

- [ ] **Step 2: Create avatar route**

Create `src/app/api/user/avatar/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AVATARS, STARTER_AVATARS, getRandomStarterKey } from "@/lib/avatars";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarKey: true },
  });

  // Get user's XP to determine unlocked avatars
  const streak = await prisma.userStreak.findFirst({
    where: { userId: session.user.id, type: "daily" },
    select: { totalXp: true },
  });

  const xp = streak?.totalXp ?? 0;
  const unlocked = AVATARS.filter((a) => {
    if (a.unlockType === "default") return true;
    if (a.unlockType === "xp" && a.unlockThreshold && xp >= a.unlockThreshold) return true;
    return false;
  });

  return NextResponse.json({
    current: user?.avatarKey ?? null,
    unlocked,
    totalAvailable: AVATARS.length,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.regenerate) {
    // Random re-roll from starter set
    const newKey = getRandomStarterKey();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarKey: newKey },
    });
    return NextResponse.json({ avatarKey: newKey });
  }

  const key = body.avatarKey;
  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "avatarKey is required" }, { status: 400 });
  }

  // Verify avatar exists and is unlocked
  const avatar = AVATARS.find((a) => a.key === key);
  if (!avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  if (avatar.unlockType === "xp" && avatar.unlockThreshold) {
    const streak = await prisma.userStreak.findFirst({
      where: { userId: session.user.id, type: "daily" },
      select: { totalXp: true },
    });
    if ((streak?.totalXp ?? 0) < avatar.unlockThreshold) {
      return NextResponse.json({ error: "Avatar not yet unlocked" }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarKey: key },
  });

  return NextResponse.json({ avatarKey: key });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/user/display-name/regenerate/ src/app/api/user/avatar/
git commit -m "Add display name regeneration and avatar get/set APIs"
```

---

### Task 7: CommunityTabs Component

**Files:**
- Create: `src/components/community/CommunityTabs.tsx`
- Create: `src/components/community/CommunityTabs.test.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Write the test**

Create `src/components/community/CommunityTabs.test.tsx`:

```typescript
import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommunityTabs from "./CommunityTabs";

beforeEach(() => {
  vi.restoreAllMocks();
  // Mock fetch for child components
  vi.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ routines: [], pages: 1, vents: [], total: 0 }),
  } as Response);
});

describe("CommunityTabs", () => {
  it("renders Routines and Vents tabs", () => {
    render(<CommunityTabs />);
    expect(screen.getByRole("tab", { name: "Routines" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vents" })).toBeInTheDocument();
  });

  it("shows Routines tab as active by default", () => {
    render(<CommunityTabs />);
    const routinesTab = screen.getByRole("tab", { name: "Routines" });
    expect(routinesTab).toHaveAttribute("aria-selected", "true");
  });

  it("switches to Vents tab on click", async () => {
    render(<CommunityTabs />);
    await userEvent.click(screen.getByRole("tab", { name: "Vents" }));
    const ventsTab = screen.getByRole("tab", { name: "Vents" });
    expect(ventsTab).toHaveAttribute("aria-selected", "true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/CommunityTabs.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create CommunityTabs component**

Create `src/components/community/CommunityTabs.tsx`:

```typescript
"use client";

import { useState } from "react";
import CommunityBrowser from "./CommunityBrowser";
import VentFeed from "./VentFeed";

type Tab = "routines" | "vents";

export default function CommunityTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("routines");

  return (
    <div className="flex flex-col gap-4">
      {/* Header with tabs and messages placeholder */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-cove-offwhite rounded-xl p-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "routines"}
            onClick={() => setActiveTab("routines")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "routines"
                ? "bg-white text-cove-charcoal shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Routines
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "vents"}
            onClick={() => setActiveTab("vents")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "vents"
                ? "bg-white text-cove-charcoal shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Vents
          </button>
        </div>

        {/* Messages icon placeholder (Phase 2) */}
        <button
          aria-label="Messages"
          className="p-2 text-cove-muted hover:text-cove-charcoal transition-colors rounded-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in-up">
        {activeTab === "routines" && <CommunityBrowser />}
        {activeTab === "vents" && <VentFeed />}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update dashboard to use CommunityTabs**

In `src/app/dashboard/page.tsx`, change the import:

Replace:
```typescript
import CommunityBrowser from "@/components/community/CommunityBrowser";
```
With:
```typescript
import CommunityTabs from "@/components/community/CommunityTabs";
```

Replace:
```typescript
{activeItem === "community" && isModuleEnabled("community") && (
  <CommunityBrowser />
)}
```
With:
```typescript
{activeItem === "community" && isModuleEnabled("community") && (
  <CommunityTabs />
)}
```

- [ ] **Step 5: Run test to verify it passes**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/CommunityTabs.test.tsx
```

Expected: PASS (tests may still fail if VentFeed doesn't exist yet — that's OK, the tab rendering tests should pass since VentFeed only renders when the vents tab is active and tests check default state).

- [ ] **Step 6: Commit**

```bash
git add src/components/community/CommunityTabs.tsx src/components/community/CommunityTabs.test.tsx src/app/dashboard/page.tsx
git commit -m "Add CommunityTabs with Routines/Vents sub-navigation"
```

---

### Task 8: AvatarDisplay Component

**Files:**
- Create: `src/components/community/AvatarDisplay.tsx`

- [ ] **Step 1: Create AvatarDisplay**

Create `src/components/community/AvatarDisplay.tsx`:

```typescript
import { getAvatarByKey } from "@/lib/avatars";

interface AvatarDisplayProps {
  avatarKey?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-sm",
  md: "w-8 h-8 text-lg",
  lg: "w-12 h-12 text-2xl",
};

export default function AvatarDisplay({ avatarKey, size = "md", className = "" }: AvatarDisplayProps) {
  const avatar = avatarKey ? getAvatarByKey(avatarKey) : null;
  const emoji = avatar?.emoji ?? "\u{1F331}";

  return (
    <div
      className={`rounded-full bg-cove-offwhite border border-cove-border-light flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
      aria-label={avatar?.label ?? "Avatar"}
    >
      {emoji}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/community/AvatarDisplay.tsx
git commit -m "Add AvatarDisplay component for rendering user avatars"
```

---

### Task 9: VentComposer Component

**Files:**
- Create: `src/components/community/VentComposer.tsx`
- Create: `src/components/community/VentComposer.test.tsx`

- [ ] **Step 1: Write the test**

Create `src/components/community/VentComposer.test.tsx`:

```typescript
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VentComposer from "./VentComposer";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VentComposer", () => {
  it("renders textarea and lifespan options", () => {
    render(<VentComposer onCreated={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText(/let it out/i)).toBeInTheDocument();
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("48h")).toBeInTheDocument();
    expect(screen.getByText("5 days")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
  });

  it("disables post button when text is empty", () => {
    render(<VentComposer onCreated={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("calls onCreated after successful submit", async () => {
    const onCreated = vi.fn();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "v1" }),
    } as Response);

    render(<VentComposer onCreated={onCreated} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/let it out/i), "I'm so frustrated today");
    await userEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<VentComposer onCreated={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/VentComposer.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create VentComposer**

Create `src/components/community/VentComposer.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface VentComposerProps {
  onCreated: () => void;
  onCancel: () => void;
}

const LIFESPANS = [
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "5d", label: "5 days" },
  { value: "7d", label: "7 days" },
];

const CONTACT_OPTIONS = [
  { value: "both", label: "DMs & replies" },
  { value: "dms", label: "DMs only" },
  { value: "anonymous_replies", label: "Anonymous replies only" },
];

export default function VentComposer({ onCreated, onCancel }: VentComposerProps) {
  const [body, setBody] = useState("");
  const [lifespan, setLifespan] = useState("48h");
  const [contactPreference, setContactPreference] = useState("both");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch("/api/community/vents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          lifespan,
          contactPreference,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t post. Try again.", "error");
        return;
      }
      toast("Vent posted.", "success");
      onCreated();
    } catch {
      toast("Couldn\u2019t post. Try again.", "error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Let it out... this is a safe space."
        rows={4}
        maxLength={2000}
        className="w-full px-4 py-3 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted resize-none"
      />

      <div className="flex items-center justify-between text-xs text-cove-muted">
        <span>{body.length}/2000</span>
      </div>

      {/* Lifespan picker */}
      <div>
        <p className="text-xs font-medium text-cove-muted mb-1.5">Disappears after</p>
        <div className="flex gap-1.5">
          {LIFESPANS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLifespan(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                lifespan === opt.value
                  ? "bg-cove-accent text-white"
                  : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact preference */}
      <div>
        <p className="text-xs font-medium text-cove-muted mb-1.5">How can people reach you?</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTACT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setContactPreference(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                contactPreference === opt.value
                  ? "bg-cove-accent text-white"
                  : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={posting || !body.trim()}
          aria-label="Post"
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {posting ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="px-4 py-2.5 text-sm text-cove-muted hover:text-cove-charcoal rounded-xl border border-cove-border-light hover:border-cove-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/VentComposer.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/community/VentComposer.tsx src/components/community/VentComposer.test.tsx
git commit -m "Add VentComposer form with lifespan and contact preference pickers"
```

---

### Task 10: VentCard Component

**Files:**
- Create: `src/components/community/VentCard.tsx`

- [ ] **Step 1: Create VentCard**

Create `src/components/community/VentCard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import AvatarDisplay from "./AvatarDisplay";

export interface VentData {
  id: string;
  body: string;
  lifespan: string;
  expiresAt: string;
  contactPreference: string;
  createdAt: string;
  displayName: string | null;
  avatarKey: string | null;
  commentCount: number;
  isOwn: boolean;
}

interface VentCardProps {
  vent: VentData;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  onProfileClick?: (displayName: string, avatarKey: string | null) => void;
}

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

export default function VentCard({ vent, onDelete, onExpand, onProfileClick }: VentCardProps) {
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const { toast } = useToast();

  async function handleReport() {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/community/vents/${vent.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t report. Try again.", "error");
        return;
      }
      toast("Report submitted. Thank you.", "success");
      setShowReportInput(false);
      setReportReason("");
    } catch {
      toast("Couldn\u2019t report. Try again.", "error");
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl p-4 flex flex-col gap-3">
      {/* Header: avatar + name + time */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onProfileClick?.(vent.displayName ?? "anonymous", vent.avatarKey)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <AvatarDisplay avatarKey={vent.avatarKey} size="sm" />
          <span className="text-xs font-medium text-cove-charcoal">
            {vent.displayName ?? "anonymous"}
          </span>
        </button>
        <span className="text-xs text-cove-muted ml-auto">{timeRemaining(vent.expiresAt)}</span>
      </div>

      {/* Body */}
      <p className="text-sm text-cove-charcoal leading-relaxed whitespace-pre-wrap">{vent.body}</p>

      {/* Footer: actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onExpand(vent.id)}
          className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {vent.commentCount > 0 ? vent.commentCount : "Comment"}
        </button>

        {!vent.isOwn && (
          <button
            onClick={() => setShowReportInput(!showReportInput)}
            className="text-xs text-cove-muted hover:text-cove-error transition-colors"
          >
            Report
          </button>
        )}

        {vent.isOwn && (
          <button
            onClick={() => onDelete(vent.id)}
            className="text-xs text-cove-muted hover:text-cove-error transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {/* Report input */}
      {showReportInput && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting this?"
            maxLength={200}
            className="flex-1 px-3 py-1.5 text-xs border border-cove-border-light rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-1 focus:ring-cove-accent/30"
          />
          <button
            onClick={handleReport}
            disabled={reporting || !reportReason.trim()}
            className="text-xs px-3 py-1.5 bg-cove-error text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/community/VentCard.tsx
git commit -m "Add VentCard component with time remaining, report, and delete"
```

---

### Task 11: VentComments Component

**Files:**
- Create: `src/components/community/VentComments.tsx`

- [ ] **Step 1: Create VentComments**

Create `src/components/community/VentComments.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import AvatarDisplay from "./AvatarDisplay";

interface Comment {
  id: string;
  body: string;
  displayName: string | null;
  avatarKey: string | null;
  createdAt: string;
  isOwn: boolean;
}

interface VentCommentsProps {
  ventId: string;
  onProfileClick?: (displayName: string, avatarKey: string | null) => void;
}

export default function VentComments({ ventId, onProfileClick }: VentCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/community/vents/${ventId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ventId]);

  async function handlePost() {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/community/vents/${ventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t post comment.", "error");
        return;
      }
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch {
      toast("Couldn\u2019t post comment.", "error");
    } finally {
      setPosting(false);
    }
  }

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  if (loading) {
    return <div className="h-12 animate-pulse rounded-lg bg-cove-border-light" />;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-cove-border-light pt-3">
      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <button
                onClick={() => onProfileClick?.(comment.displayName ?? "anonymous", comment.avatarKey)}
                className="shrink-0"
              >
                <AvatarDisplay avatarKey={comment.avatarKey} size="sm" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-cove-charcoal">
                    {comment.displayName ?? "anonymous"}
                  </span>
                  <span className="text-xs text-cove-muted">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-cove-charcoal mt-0.5">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New comment input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          className="flex-1 px-3 py-2 text-sm border border-cove-border-light rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-1 focus:ring-cove-accent/30"
        />
        <button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="px-3 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover disabled:opacity-50 transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/community/VentComments.tsx
git commit -m "Add VentComments component with comment list and input"
```

---

### Task 12: VentFeed Component

**Files:**
- Create: `src/components/community/VentFeed.tsx`
- Create: `src/components/community/VentFeed.test.tsx`

- [ ] **Step 1: Write the test**

Create `src/components/community/VentFeed.test.tsx`:

```typescript
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VentFeed from "./VentFeed";

const mockVents = [
  {
    id: "v1",
    body: "Having a rough day",
    lifespan: "48h",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    contactPreference: "both",
    createdAt: new Date().toISOString(),
    displayName: "calm_river_42",
    avatarKey: "fox",
    commentCount: 2,
    isOwn: false,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VentFeed", () => {
  it("shows loading state", () => {
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    const { container } = render(<VentFeed />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders vents after fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: mockVents, pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText("Having a rough day")).toBeInTheDocument();
    });
    expect(screen.getByText("calm_river_42")).toBeInTheDocument();
  });

  it("shows new vent form when button clicked", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: [], pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText("+ New vent")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("+ New vent"));
    expect(screen.getByPlaceholderText(/let it out/i)).toBeInTheDocument();
  });

  it("shows guidelines banner", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: [], pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText(/safe space/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/VentFeed.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create VentFeed**

Create `src/components/community/VentFeed.tsx`:

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import VentCard, { type VentData } from "./VentCard";
import VentComposer from "./VentComposer";
import VentComments from "./VentComments";

export default function VentFeed() {
  const [vents, setVents] = useState<VentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedVentId, setExpandedVentId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVents = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/community/vents?page=${page}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVents(data.vents);
      setTotalPages(data.pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVents();
  }, [fetchVents]);

  async function handleDelete(id: string) {
    const prev = vents;
    setVents((v) => v.filter((vent) => vent.id !== id));
    try {
      const res = await fetch(`/api/community/vents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Vent deleted.", "success");
    } catch {
      setVents(prev);
      toast("Couldn\u2019t delete. Try again.", "error");
    }
  }

  function handleExpand(id: string) {
    setExpandedVentId(expandedVentId === id ? null : id);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Guidelines banner */}
      <div className="bg-cove-sage-light/50 border border-cove-sage/20 rounded-xl px-4 py-3">
        <p className="text-xs text-cove-charcoal leading-relaxed">
          A safe space to let things out. Be kind — everyone here is figuring it out.
        </p>
      </div>

      {/* New vent button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-cove-charcoal">Recent vents</h3>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          {showComposer ? "Cancel" : "+ New vent"}
        </button>
      </div>

      {/* Composer */}
      {showComposer && (
        <div className="animate-fade-in-up">
          <VentComposer
            onCreated={() => {
              setShowComposer(false);
              fetchVents();
            }}
            onCancel={() => setShowComposer(false)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-cove-border-light animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
          <p className="text-cove-muted">Couldn&apos;t load vents.</p>
          <button
            onClick={fetchVents}
            className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && vents.length === 0 && !showComposer && (
        <div className="text-center py-8 px-6 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-base font-medium text-cove-charcoal mb-2">No vents yet</p>
          <p className="text-sm text-cove-muted leading-relaxed max-w-md mx-auto">
            Sometimes you just need to get something off your chest. Post a vent and it&apos;ll disappear after the time you choose.
          </p>
        </div>
      )}

      {/* Vent list */}
      {!loading && !error && vents.length > 0 && (
        <div className="flex flex-col gap-3">
          {vents.map((vent) => (
            <div key={vent.id}>
              <VentCard
                vent={vent}
                onDelete={handleDelete}
                onExpand={handleExpand}
              />
              {expandedVentId === vent.id && (
                <div className="mt-2 ml-4 animate-fade-in-up">
                  <VentComments ventId={vent.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-cove-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run src/components/community/VentFeed.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/community/VentFeed.tsx src/components/community/VentFeed.test.tsx
git commit -m "Add VentFeed with vent list, composer toggle, comments expand, and pagination"
```

---

### Task 13: RoutineSharePicker and Top-Level Share Button

**Files:**
- Create: `src/components/community/RoutineSharePicker.tsx`
- Modify: `src/components/routines/RoutineList.tsx`

- [ ] **Step 1: Create RoutineSharePicker**

Create `src/components/community/RoutineSharePicker.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

interface RoutineOption {
  id: string;
  name: string;
  steps: { id: string; title: string; durationMinutes?: number | null }[];
  startTime?: string | null;
  showTimes?: boolean;
  showDurations?: boolean;
}

interface RoutineSharePickerProps {
  onSelect: (routine: RoutineOption) => void;
  onCancel: () => void;
}

export default function RoutineSharePicker({ onSelect, onCancel }: RoutineSharePickerProps) {
  const [routines, setRoutines] = useState<RoutineOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/routines")
      .then((res) => (res.ok ? res.json() : []))
      .then(setRoutines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-cove-card border border-cove-border-light rounded-xl p-5">
        <div className="h-20 animate-pulse rounded-lg bg-cove-border-light" />
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-cove-card border border-cove-border-light rounded-xl p-5 text-center">
        <p className="text-sm text-cove-muted">No routines to share yet. Create one first!</p>
        <button
          onClick={onCancel}
          className="mt-3 text-sm text-cove-accent hover:text-cove-accent-hover"
        >
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cove-charcoal">Choose a routine to share</h3>
        <button
          onClick={onCancel}
          className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => onSelect(routine)}
            className="text-left p-3 rounded-lg border border-cove-border-light hover:border-cove-accent/40 hover:bg-cove-offwhite transition-colors"
          >
            <p className="text-sm font-medium text-cove-charcoal">{routine.name}</p>
            <p className="text-xs text-cove-muted mt-0.5">{routine.steps.length} steps</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add top-level share button to RoutineList**

In `src/components/routines/RoutineList.tsx`, add import at the top:

```typescript
import RoutineSharePicker from "@/components/community/RoutineSharePicker";
```

Add state after `sharingRoutine`:

```typescript
const [showSharePicker, setShowSharePicker] = useState(false);
```

In the header section, replace:
```typescript
<div className="flex items-center justify-between">
  <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Routines</h2>
  <button
```

With:
```typescript
<div className="flex items-center justify-between">
  <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Routines</h2>
  <div className="flex items-center gap-3">
    <button
      onClick={() => setShowSharePicker(!showSharePicker)}
      className="text-sm text-cove-accent hover:text-cove-accent-hover transition-colors flex items-center gap-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share
    </button>
    <button
```

And close the wrapping `</div>` — add `</div>` after the existing "+ New routine" / "Cancel" button's closing `</button>`:

Find:
```typescript
          >
            {showForm ? "Cancel" : "+ New routine"}
          </button>
        </div>
```

Replace with:
```typescript
          >
            {showForm ? "Cancel" : "+ New routine"}
          </button>
          </div>
        </div>
```

Then add the share picker rendering after the templates/AI section (`{!showForm && (` block), before `{/* Form */}`:

```typescript
      {/* Share picker */}
      {showSharePicker && !showForm && (
        <div className="animate-fade-in-up">
          <RoutineSharePicker
            onSelect={(routine) => {
              setShowSharePicker(false);
              setSharingRoutine({
                id: routine.id,
                name: routine.name,
                steps: routine.steps,
                active: true,
                startTime: routine.startTime,
                showTimes: routine.showTimes,
                showDurations: routine.showDurations,
              });
            }}
            onCancel={() => setShowSharePicker(false)}
          />
        </div>
      )}
```

- [ ] **Step 3: Run all tests**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/community/RoutineSharePicker.tsx src/components/routines/RoutineList.tsx
git commit -m "Add top-level Share to Community button with routine picker on Routines tab"
```

---

### Task 14: ProfileCard Component

**Files:**
- Create: `src/components/community/ProfileCard.tsx`

- [ ] **Step 1: Create ProfileCard**

Create `src/components/community/ProfileCard.tsx`:

```typescript
"use client";

import AvatarDisplay from "./AvatarDisplay";

interface ProfileCardProps {
  displayName: string;
  avatarKey: string | null;
  onRequestChat?: () => void;
  onClose: () => void;
}

export default function ProfileCard({ displayName, avatarKey, onRequestChat, onClose }: ProfileCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <AvatarDisplay avatarKey={avatarKey} size="lg" />
        <p className="text-base font-semibold text-cove-charcoal">{displayName}</p>

        <div className="flex flex-col gap-2 w-full">
          {onRequestChat && (
            <button
              onClick={onRequestChat}
              className="w-full py-2.5 text-sm font-medium text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-colors"
            >
              Request to chat
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-cove-muted hover:text-cove-charcoal rounded-xl border border-cove-border-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/community/ProfileCard.tsx
git commit -m "Add ProfileCard modal with avatar, display name, and request-to-chat button"
```

---

### Task 15: Integration — Wire ProfileCard into VentFeed

**Files:**
- Modify: `src/components/community/VentFeed.tsx`

- [ ] **Step 1: Add ProfileCard state and rendering to VentFeed**

In `src/components/community/VentFeed.tsx`, add import:

```typescript
import ProfileCard from "./ProfileCard";
```

Add state after `expandedVentId`:

```typescript
const [profileTarget, setProfileTarget] = useState<{ displayName: string; avatarKey: string | null } | null>(null);
```

Add a handler function after `handleExpand`:

```typescript
function handleProfileClick(displayName: string, avatarKey: string | null) {
  setProfileTarget({ displayName, avatarKey });
}
```

Pass `onProfileClick` to VentCard:

Replace:
```typescript
<VentCard
  vent={vent}
  onDelete={handleDelete}
  onExpand={handleExpand}
/>
```

With:
```typescript
<VentCard
  vent={vent}
  onDelete={handleDelete}
  onExpand={handleExpand}
  onProfileClick={handleProfileClick}
/>
```

Pass `onProfileClick` to VentComments:

Replace:
```typescript
<VentComments ventId={vent.id} />
```

With:
```typescript
<VentComments ventId={vent.id} onProfileClick={handleProfileClick} />
```

Add ProfileCard rendering before the closing `</div>` of the component:

```typescript
      {/* Profile card modal */}
      {profileTarget && (
        <ProfileCard
          displayName={profileTarget.displayName}
          avatarKey={profileTarget.avatarKey}
          onClose={() => setProfileTarget(null)}
        />
      )}
```

- [ ] **Step 2: Run all tests**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/community/VentFeed.tsx
git commit -m "Wire ProfileCard into VentFeed for avatar/name clicks"
```

---

### Task 16: Final Integration Test and Cleanup

**Files:**
- Modify: `src/components/community/CommunityBrowser.tsx` (optional cleanup)

- [ ] **Step 1: Run full test suite**

Run:
```bash
cd /Users/EmmaBB/cove && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run lint**

Run:
```bash
cd /Users/EmmaBB/cove && npx eslint src/components/community/ src/app/api/community/vents/ src/lib/randomName.ts src/lib/avatars.ts
```

Expected: No errors.

- [ ] **Step 3: Verify build compiles**

Run:
```bash
cd /Users/EmmaBB/cove && npx next build
```

Expected: Build succeeds (or only pre-existing issues).

- [ ] **Step 4: Commit any lint/type fixes if needed**

```bash
git add -A
git commit -m "Fix lint and type issues from community vents implementation"
```
