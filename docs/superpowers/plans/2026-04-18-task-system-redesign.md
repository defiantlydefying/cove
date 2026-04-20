# Task System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat task sidebar with a pipeline-based system (Inbox/Today/Upcoming/Someday) with AI breakdown, guilt-free deferral, and planner calendar integration.

**Architecture:** Two phases — Phase 1 builds the core pipeline, new fields, sidebar Today view, full-page Tasks view, AI breakdown, and task actions. Phase 2 adds linked PlannerItems so tasks can be dragged onto the week calendar as time blocks with bidirectional completion sync.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, React, Tailwind CSS, Google Generative AI (Gemini 2.5 Flash), existing toast/haptics/gamification systems.

---

## Phase 1: Task System Core

### Task 1: Schema Migration — Add Pipeline Fields to Task

**Files:**
- Modify: `prisma/schema.prisma` (Task model, around line 79)
- Create: `prisma/migrations/20260418000000_task_pipeline_fields/migration.sql`

- [ ] **Step 1: Update Task model in schema.prisma**

Add these fields after the existing `completed` field:

```prisma
model Task {
  id             String    @id @default(cuid())
  userId         String
  title          String
  description    String?
  completed      Boolean   @default(false)
  completedAt    DateTime?
  status         String    @default("active")
  stage          String    @default("inbox")
  scheduledDate  DateTime? @db.Date
  completedReason String?
  deferredUntil  DateTime? @db.Date
  deadline       DateTime?
  priority       String    @default("medium")
  energyLevel    String?
  parentId       String?
  sortOrder      Int       @default(0)
  isRecurring    Boolean   @default(false)
  recurrenceRule String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent     Task?         @relation("SubTasks", fields: [parentId], references: [id])
  subTasks   Task[]        @relation("SubTasks")
  focusSessions FocusSession[]
  plannerItems  PlannerItem[]
  timeEntries   TimeEntry[]

  @@index([userId, stage])
  @@index([userId, scheduledDate])
}
```

- [ ] **Step 2: Create migration SQL**

```sql
-- Add pipeline fields to Task
ALTER TABLE "Task" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Task" ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'inbox';
ALTER TABLE "Task" ADD COLUMN "scheduledDate" DATE;
ALTER TABLE "Task" ADD COLUMN "completedReason" TEXT;
ALTER TABLE "Task" ADD COLUMN "deferredUntil" DATE;

-- Migrate existing completed tasks
UPDATE "Task" SET "status" = 'completed', "stage" = 'today' WHERE "completed" = true;
UPDATE "Task" SET "stage" = 'inbox' WHERE "completed" = false;

-- Create indexes
CREATE INDEX "Task_userId_stage_idx" ON "Task"("userId", "stage");
CREATE INDEX "Task_userId_scheduledDate_idx" ON "Task"("userId", "scheduledDate");
```

- [ ] **Step 3: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client" success message

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds with no type errors

---

### Task 2: Update Tasks API — Stage Filtering and New Fields

**Files:**
- Modify: `src/app/api/tasks/route.ts`
- Modify: `src/app/api/tasks/[id]/route.ts`

- [ ] **Step 1: Update GET to support stage filtering**

Replace the GET handler in `src/app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stage = req.nextUrl.searchParams.get("stage");
  const search = req.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = {
    userId: session.user.id,
    parentId: null, // Only top-level tasks
  };

  if (stage) {
    if (stage === "done") {
      where.status = { in: ["completed", "wont_do"] };
    } else {
      where.stage = stage;
      where.status = "active";
    }
  } else {
    where.status = "active";
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // Hide deferred tasks that haven't reached their date yet
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.task.findMany({
    where: {
      ...where,
      OR: [
        { deferredUntil: null },
        { deferredUntil: { lte: today } },
      ],
    },
    include: {
      subTasks: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}
```

- [ ] **Step 2: Update POST to default to inbox stage**

Update the POST handler in the same file to include stage:

```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Determine stage from scheduledDate
  let stage = body.stage || "inbox";
  if (body.scheduledDate) {
    const scheduled = new Date(body.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduled.setHours(0, 0, 0, 0);
    stage = scheduled.getTime() === today.getTime() ? "today" : "upcoming";
  }

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: body.title.trim(),
      description: body.description ?? null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      priority: body.priority ?? "medium",
      energyLevel: body.energyLevel ?? null,
      parentId: body.parentId ?? null,
      stage,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      isRecurring: body.isRecurring ?? false,
      recurrenceRule: body.recurrenceRule ?? null,
    },
    include: { subTasks: true },
  });

  return NextResponse.json(task, { status: 201 });
}
```

- [ ] **Step 3: Update PATCH to handle new fields and auto-stage**

Replace the PATCH handler in `src/app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordActivity } from "@/lib/gamification";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  // Basic fields
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.energyLevel !== undefined) data.energyLevel = body.energyLevel;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.parentId !== undefined) data.parentId = body.parentId;
  if (body.isRecurring !== undefined) data.isRecurring = body.isRecurring;
  if (body.recurrenceRule !== undefined) data.recurrenceRule = body.recurrenceRule;

  // Deadline
  if (body.deadline !== undefined) {
    data.deadline = body.deadline ? new Date(body.deadline) : null;
  }

  // Scheduled date with auto-stage
  if (body.scheduledDate !== undefined) {
    data.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
    if (body.scheduledDate) {
      const scheduled = new Date(body.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduled.setHours(0, 0, 0, 0);
      data.stage = scheduled.getTime() === today.getTime() ? "today" : "upcoming";
    }
  }

  // Explicit stage override
  if (body.stage !== undefined) data.stage = body.stage;

  // Deferred until
  if (body.deferredUntil !== undefined) {
    data.deferredUntil = body.deferredUntil ? new Date(body.deferredUntil) : null;
  }

  // Status changes: complete or won't-do
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "completed") {
      data.completedAt = new Date();
      data.completed = true;
    } else if (body.status === "wont_do") {
      data.completedAt = new Date();
      data.completed = true;
      if (body.completedReason !== undefined) {
        data.completedReason = body.completedReason;
      }
    } else if (body.status === "active") {
      data.completedAt = null;
      data.completed = false;
      data.completedReason = null;
    }
  }

  // Legacy completed toggle (backwards compat with existing UI)
  if (body.completed !== undefined && body.status === undefined) {
    data.completed = body.completed;
    data.status = body.completed ? "completed" : "active";
    data.completedAt = body.completed ? new Date() : null;
    if (!body.completed) {
      data.completedReason = null;
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
    include: { subTasks: true },
  });

  // Gamification on completion
  let gamification = null;
  if (
    (body.status === "completed" || (body.completed && !existing.completed)) &&
    existing.status !== "completed"
  ) {
    try {
      gamification = await recordActivity(session.user.id, "tasks");
    } catch { /* non-blocking */ }
  }

  // Sync linked planner items on completion
  if (data.status === "completed" || data.status === "wont_do") {
    await prisma.plannerItem.updateMany({
      where: { linkedTaskId: id },
      data: { completed: true },
    }).catch(() => {});
  }

  return NextResponse.json({ ...updated, gamification });
}
```

- [ ] **Step 4: Keep DELETE handler unchanged**

The existing DELETE handler in `src/app/api/tasks/[id]/route.ts` is fine. Prisma cascade will handle cleanup.

- [ ] **Step 5: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 3: AI Task Breakdown Endpoint

**Files:**
- Create: `src/app/api/tasks/breakdown/route.ts`

- [ ] **Step 1: Create the breakdown API endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a task breakdown assistant for people who struggle with executive function. Given a task title and optional description, break it into smaller, actionable sub-steps.

Rules:
- Each step must start with a verb (action word)
- Steps should be specific and concrete, not vague
- Adjust the number of steps based on the granularity level:
  - Level 1: 3-4 broad steps
  - Level 2: 4-6 steps with some detail
  - Level 3: 5-8 detailed steps
  - Level 4: 8-12 specific steps
  - Level 5: 10-15 micro-steps (very granular, for when starting feels impossible)

Return JSON: { "steps": [{ "title": "Step description" }] }`;

const MOCK_STEPS = [
  { title: "Gather everything you need" },
  { title: "Set a timer for 15 minutes" },
  { title: "Start with the easiest part" },
  { title: "Take a short break if needed" },
  { title: "Finish the remaining pieces" },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; description?: string; granularity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const granularity = Math.min(5, Math.max(1, body.granularity ?? 3));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ steps: MOCK_STEPS });
  }

  try {
    const prompt = `Break down this task into sub-steps at granularity level ${granularity}/5:

Task: ${body.title.trim()}${body.description ? `\nDetails: ${body.description.trim()}` : ""}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch
      ? jsonMatch[0]
      : text.replace(/^```(?:json)?\s*\n?/gi, "").replace(/\n?```\s*$/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.steps)) {
      throw new Error("Unexpected response structure");
    }

    return NextResponse.json({
      steps: parsed.steps.map((s: { title: string }) => ({ title: s.title })),
    });
  } catch (error) {
    console.error("Task breakdown failed:", error);
    return NextResponse.json({ steps: MOCK_STEPS });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds, `/api/tasks/breakdown` appears in route list

---

### Task 4: TaskActions Component — Defer and Won't Do Popovers

**Files:**
- Create: `src/components/tasks/TaskActions.tsx`

- [ ] **Step 1: Create the TaskActions component**

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

interface DeferOption {
  label: string;
  getValue: () => { scheduledDate: string; stage: string; deferredUntil: string };
}

function todayStr() { return new Date().toISOString().split("T")[0]; }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function nextMondayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

const DEFER_OPTIONS: DeferOption[] = [
  { label: "Tomorrow", getValue: () => ({ scheduledDate: tomorrowStr(), stage: "upcoming", deferredUntil: tomorrowStr() }) },
  { label: "Next week", getValue: () => ({ scheduledDate: nextMondayStr(), stage: "upcoming", deferredUntil: nextMondayStr() }) },
  { label: "Someday", getValue: () => ({ scheduledDate: "", stage: "someday", deferredUntil: "" }) },
];

const WONT_DO_REASONS = ["Not relevant", "Too big", "Scope changed"];

interface TaskActionsProps {
  onDefer: (data: { scheduledDate?: string; stage: string; deferredUntil?: string }) => void;
  onWontDo: (reason?: string) => void;
  onSchedule: (date: string) => void;
  onBreakdown: () => void;
}

export function DeferPopover({ onDefer, onClose }: { onDefer: TaskActionsProps["onDefer"]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 w-48 bg-cove-card border border-cove-border rounded-xl shadow-lg overflow-hidden">
      {DEFER_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => {
            const val = opt.getValue();
            onDefer({
              scheduledDate: val.scheduledDate || undefined,
              stage: val.stage,
              deferredUntil: val.deferredUntil || undefined,
            });
            onClose();
          }}
          className="w-full px-3 py-2 text-xs text-left text-cove-charcoal hover:bg-cove-offwhite transition-colors"
        >
          {opt.label}
        </button>
      ))}
      <div className="border-t border-cove-border/30">
        {showPicker ? (
          <div className="p-2">
            <input
              type="date"
              min={tomorrowStr()}
              onChange={(e) => {
                if (e.target.value) {
                  const isToday = e.target.value === todayStr();
                  onDefer({
                    scheduledDate: e.target.value,
                    stage: isToday ? "today" : "upcoming",
                    deferredUntil: e.target.value,
                  });
                  onClose();
                }
              }}
              autoFocus
              className="w-full px-2 py-1.5 text-xs border border-cove-border rounded-lg bg-cove-offwhite text-cove-charcoal focus:outline-none focus:border-cove-accent"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full px-3 py-2 text-xs text-left text-cove-muted hover:bg-cove-offwhite transition-colors"
          >
            Pick a date...
          </button>
        )}
      </div>
    </div>
  );
}

export function WontDoPopover({ onWontDo, onClose }: { onWontDo: TaskActionsProps["onWontDo"]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 w-56 bg-cove-card border border-cove-border rounded-xl shadow-lg overflow-hidden">
      <div className="px-3 pt-2 pb-1">
        <p className="text-[10px] text-cove-muted">Why? (optional)</p>
      </div>
      {WONT_DO_REASONS.map((reason) => (
        <button
          key={reason}
          onClick={() => { onWontDo(reason); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-charcoal hover:bg-cove-offwhite transition-colors"
        >
          {reason}
        </button>
      ))}
      <div className="border-t border-cove-border/30 p-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) { onWontDo(custom.trim()); onClose(); }
          }}
          placeholder="Other reason..."
          className="w-full px-2 py-1.5 text-xs border border-cove-border rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:border-cove-accent"
        />
      </div>
      <div className="border-t border-cove-border/30">
        <button
          onClick={() => { onWontDo(); onClose(); }}
          className="w-full px-3 py-2 text-xs text-left text-cove-muted hover:bg-cove-offwhite transition-colors"
        >
          Skip — just archive it
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 5: TaskBreakdown Component — AI Breakdown UI

**Files:**
- Create: `src/components/tasks/TaskBreakdown.tsx`

- [ ] **Step 1: Create the TaskBreakdown component**

```typescript
"use client";

import { useState } from "react";

const GRANULARITY_LABELS = [
  "", "Broad steps", "Some detail", "Detailed", "Specific", "Micro-steps"
];

interface TaskBreakdownProps {
  taskTitle: string;
  taskDescription?: string;
  onAccept: (steps: { title: string }[]) => void;
  onCancel: () => void;
}

export default function TaskBreakdown({ taskTitle, taskDescription, onAccept, onCancel }: TaskBreakdownProps) {
  const [granularity, setGranularity] = useState(3);
  const [steps, setSteps] = useState<{ title: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function generate() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/tasks/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDescription, granularity }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSteps(data.steps || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 p-3 bg-cove-offwhite rounded-xl border border-cove-border/50">
      {/* Granularity slider */}
      <div className="flex items-center gap-3 mb-3">
        <label className="text-[10px] text-cove-muted shrink-0">Detail level</label>
        <input
          type="range"
          min={1}
          max={5}
          value={granularity}
          onChange={(e) => { setGranularity(Number(e.target.value)); setSteps(null); }}
          className="flex-1 h-1.5 accent-cove-accent"
        />
        <span className="text-[10px] text-cove-accent font-medium w-20 text-right">
          {GRANULARITY_LABELS[granularity]}
        </span>
      </div>

      {/* Generate / Regenerate */}
      {!steps && (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Breaking it down..." : "Generate steps"}
        </button>
      )}

      {error && (
        <p className="text-xs text-cove-error mt-2">Couldn&apos;t generate steps. Try again.</p>
      )}

      {/* Preview */}
      {steps && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-cove-muted">{steps.length} steps generated</p>
          <ul className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-cove-charcoal">
                <span className="text-cove-muted shrink-0 mt-0.5">{i + 1}.</span>
                {step.title}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onAccept(steps)}
              className="flex-1 py-1.5 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => { setSteps(null); generate(); }}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel when no steps yet */}
      {!steps && !loading && (
        <button
          onClick={onCancel}
          className="w-full mt-2 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 6: Rewrite TaskItem — Pipeline Actions and Sub-Tasks

**Files:**
- Modify: `src/components/tasks/TaskItem.tsx`

- [ ] **Step 1: Rewrite TaskItem with new actions**

```typescript
"use client";

import { useState, memo } from "react";
import { tapLight } from "@/lib/capacitor/haptics";
import { DeferPopover, WontDoPopover } from "./TaskActions";
import TaskBreakdown from "./TaskBreakdown";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  status: string;
  stage: string;
  scheduledDate?: string;
  deferredUntil?: string;
  deadline?: string;
  priority: string;
  energyLevel?: string;
  parentId?: string;
  sortOrder: number;
  completedReason?: string;
  subTasks?: Task[];
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onAddSubTasks: (parentId: string, steps: { title: string }[]) => void;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: () => void;
}

const PRIORITY_DOTS: Record<string, string> = {
  high: "bg-cove-error",
  medium: "bg-cove-amber",
  low: "bg-cove-accent",
};

const ENERGY_LABELS: Record<string, { text: string; color: string }> = {
  "low energy": { text: "Low", color: "text-cove-accent bg-cove-accent/10" },
  moderate: { text: "Med", color: "text-cove-amber bg-cove-amber/10" },
  "high focus": { text: "High", color: "text-cove-error bg-cove-error/10" },
};

export default memo(function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubTasks,
  compact,
  draggable,
  onDragStart,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDefer, setShowDefer] = useState(false);
  const [showWontDo, setShowWontDo] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const hasSubTasks = task.subTasks && task.subTasks.length > 0;
  const completedSubTasks = task.subTasks?.filter((s) => s.completed).length ?? 0;
  const totalSubTasks = task.subTasks?.length ?? 0;
  const isCompleted = task.status === "completed" || task.status === "wont_do";

  const handleDefer = (data: { scheduledDate?: string; stage: string; deferredUntil?: string }) => {
    onUpdate(task.id, {
      scheduledDate: data.scheduledDate || undefined,
      stage: data.stage,
      deferredUntil: data.deferredUntil || undefined,
    } as Partial<Task>);
  };

  const handleWontDo = (reason?: string) => {
    onUpdate(task.id, {
      status: "wont_do",
      completedReason: reason,
    } as Partial<Task>);
  };

  const handleBreakdownAccept = (steps: { title: string }[]) => {
    onAddSubTasks(task.id, steps);
    setShowBreakdown(false);
  };

  return (
    <div
      className={`group ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className={`flex items-start gap-2.5 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors ${isCompleted ? "opacity-40" : ""}`}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => {
            if (!isCompleted) tapLight();
            onToggle(task.id);
          }}
          aria-label={`Toggle ${task.title}`}
          className="mt-1 shrink-0 h-4 w-4 rounded accent-cove-accent"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Priority dot */}
            {task.priority !== "medium" && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOTS[task.priority] || ""}`} />
            )}

            <span className={`text-sm text-cove-sidebar-text truncate ${isCompleted ? "line-through" : ""}`}>
              {task.title}
            </span>

            {/* Energy badge */}
            {task.energyLevel && ENERGY_LABELS[task.energyLevel] && !compact && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${ENERGY_LABELS[task.energyLevel].color}`}>
                {ENERGY_LABELS[task.energyLevel].text}
              </span>
            )}
          </div>

          {/* Sub-task progress */}
          {hasSubTasks && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-cove-muted mt-0.5 hover:text-cove-accent transition-colors"
            >
              {completedSubTasks} of {totalSubTasks} steps
            </button>
          )}

          {/* Deadline */}
          {task.deadline && !compact && (
            <p className="text-[10px] text-cove-muted mt-0.5">
              Due {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          )}

          {/* Expanded sub-tasks */}
          {expanded && hasSubTasks && (
            <div className="mt-2 ml-1 flex flex-col gap-1 border-l-2 border-cove-border/30 pl-3">
              {task.subTasks!.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggle(sub.id)}
                    className="h-3 w-3 rounded accent-cove-accent"
                  />
                  <span className={`text-xs ${sub.completed ? "line-through text-cove-muted" : "text-cove-sidebar-text"}`}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => onDelete(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-cove-muted hover:text-cove-error ml-auto"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Breakdown panel */}
          {showBreakdown && (
            <TaskBreakdown
              taskTitle={task.title}
              taskDescription={task.description}
              onAccept={handleBreakdownAccept}
              onCancel={() => setShowBreakdown(false)}
            />
          )}
        </div>

        {/* Action buttons (visible on hover) */}
        {!isCompleted && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 relative">
            {/* Break down */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              title="Break it down"
              className="p-1 text-cove-muted hover:text-cove-accent transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </button>

            {/* Defer */}
            <button
              onClick={() => setShowDefer(!showDefer)}
              title="Defer"
              className="p-1 text-cove-muted hover:text-cove-charcoal transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>

            {/* Won't do */}
            <button
              onClick={() => setShowWontDo(!showWontDo)}
              title="Won't do"
              className="p-1 text-cove-muted hover:text-cove-error transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(task.id)}
              title="Delete"
              className="p-1 text-cove-muted hover:text-cove-error transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

            {/* Popovers */}
            {showDefer && <DeferPopover onDefer={handleDefer} onClose={() => setShowDefer(false)} />}
            {showWontDo && <WontDoPopover onWontDo={handleWontDo} onClose={() => setShowWontDo(false)} />}
          </div>
        )}
      </div>
    </div>
  );
});
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 7: Rewrite TaskList — Sidebar Today View

**Files:**
- Modify: `src/components/tasks/TaskList.tsx`

- [ ] **Step 1: Rewrite TaskList as a minimal Today sidebar**

The new TaskList should:
- Fetch only `?stage=today` tasks
- Show a quick capture input at top
- Show a progress bar ("3 of 7 done")
- Show a collapsible "Needs attention" section for overdue tasks
- Show a "View all tasks →" link that switches to the Tasks page
- Handle toggle, delete, update, and addSubTasks

This is a large component. The key data flow:
- Fetch tasks with `stage=today` plus overdue tasks
- Quick capture creates tasks in inbox (default) or today (with "today:" prefix)
- Toggle sends PATCH with `{ status: "completed" }` or `{ status: "active" }`
- Defer/won't-do send PATCH with new fields, task disappears from Today
- Break down sends POST to `/api/tasks/breakdown`, then creates sub-tasks via POST to `/api/tasks`
- "View all tasks" calls a callback prop to switch the nav to the Tasks page

The component receives an `onNavigateToTasks` prop to switch the main content area.

- [ ] **Step 2: Verify build and test in browser**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds. Sidebar shows Today tasks with progress bar.

---

### Task 8: TaskPipeline Component — Full Page Pipeline Views

**Files:**
- Create: `src/components/tasks/TaskPipeline.tsx`

- [ ] **Step 1: Create the pipeline view component**

This component renders different views based on the active pipeline tab (inbox/today/upcoming/someday/done). It:
- Fetches tasks for the active stage
- Renders TaskItem for each task with full actions
- Shows filtering bar (priority, energy, deadline, sub-tasks toggles)
- Shows stage-specific empty states
- Handles all CRUD operations

Key sections:
- **Inbox**: flat list with bulk actions
- **Today**: priority-sorted with progress bar and "Needs attention"
- **Upcoming**: grouped by date (next 14 days)
- **Someday**: flat list with "Move to Today" actions
- **Done**: recent completions and Won't Do items

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 9: TasksPage — Full Page Wrapper with Tabs

**Files:**
- Create: `src/components/tasks/TasksPage.tsx`

- [ ] **Step 1: Create the page wrapper**

```typescript
"use client";

import { useState } from "react";
import TaskPipeline from "./TaskPipeline";

const TABS = [
  { id: "inbox", label: "Inbox" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "someday", label: "Someday" },
  { id: "done", label: "Done" },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Pipeline tabs */}
      <div className="flex gap-1 bg-cove-offwhite rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-cove-card text-cove-accent shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline content */}
      <TaskPipeline stage={activeTab} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

---

### Task 10: Add Tasks Nav Item to Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Import TasksPage and add nav item**

Add to imports:
```typescript
import TasksPage from "@/components/tasks/TasksPage";
```

Add to the `icons` object:
```typescript
  tasks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
```

Add to `navItems` array (after daily-view):
```typescript
  { id: "tasks", label: "Tasks", icon: icons.tasks },
```

Add to `defaultModuleStates`:
```typescript
  tasks: true,
```

Add to the render section:
```typescript
  {activeItem === "tasks" && isModuleEnabled("tasks") && <TasksPage />}
```

- [ ] **Step 2: Update TaskList sidebar to pass navigation callback**

The sidebar TaskList needs an `onNavigateToTasks` prop. Update the AppShell `sidebarContent` prop in dashboard to:
```typescript
sidebarContent={<TaskList onNavigateToTasks={() => setActiveItem("tasks")} />}
```

- [ ] **Step 3: Verify build and test navigation**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds. "Tasks" appears in left nav. Clicking it shows the pipeline view.

---

## Phase 2: Planner Integration

### Task 11: Schema — Add linkedTaskId to PlannerItem

**Files:**
- Modify: `prisma/schema.prisma` (PlannerItem model)
- Create: `prisma/migrations/20260418100000_planner_linked_task/migration.sql`

- [ ] **Step 1: Add linkedTaskId field to PlannerItem**

```prisma
model PlannerItem {
  id          String   @id @default(cuid())
  userId      String
  title       String
  date        DateTime @db.Date
  zone        String   @default("must")
  sortOrder   Int      @default(0)
  startTime   String?
  endTime     String?
  completed   Boolean  @default(false)
  taskId      String?
  linkedTaskId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user       User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  task       Task? @relation(fields: [taskId], references: [id])
  linkedTask Task? @relation("PlannerLinks", fields: [linkedTaskId], references: [id], onDelete: SetNull)

  @@index([userId, date])
}
```

And on the Task model, add:
```prisma
  plannerLinks PlannerItem[] @relation("PlannerLinks")
```

- [ ] **Step 2: Create migration**

```sql
ALTER TABLE "PlannerItem" ADD COLUMN "linkedTaskId" TEXT;
ALTER TABLE "PlannerItem" ADD CONSTRAINT "PlannerItem_linkedTaskId_fkey"
  FOREIGN KEY ("linkedTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

- [ ] **Step 3: Regenerate Prisma client and verify build**

Run: `npx prisma generate && npx next build 2>&1 | tail -5`

---

### Task 12: Planner API — Linked Task Completion Sync

**Files:**
- Modify: `src/app/api/productivity/planner/route.ts`

- [ ] **Step 1: Update PATCH to sync linked task on completion**

After the existing update logic, add:

```typescript
  // Sync linked task when planner item is completed
  if (updates.completed && updated.linkedTaskId) {
    try {
      const linkedTask = await prisma.task.findFirst({
        where: { id: updated.linkedTaskId, userId: user.id },
      });
      if (linkedTask && linkedTask.status === "active") {
        await prisma.task.update({
          where: { id: updated.linkedTaskId },
          data: { status: "completed", completed: true, completedAt: new Date() },
        });
        // Record gamification
        const { recordActivity } = await import("@/lib/gamification");
        await recordActivity(user.id, "tasks").catch(() => {});
      }
    } catch { /* non-blocking */ }
  }
```

- [ ] **Step 2: Update POST to support linkedTaskId**

In the POST handler, accept `linkedTaskId` from the body and include it in the create data:

```typescript
linkedTaskId: body.linkedTaskId || null,
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -5`

---

### Task 13: PlannerPriorityView — Accept Task Drops

**Files:**
- Modify: `src/components/productivity/PlannerPriorityView.tsx`

- [ ] **Step 1: Add drop handler for external tasks**

Add a `handleTaskDrop` function that:
1. Reads the task data from the drag event's dataTransfer
2. Calculates the drop time from the Y position on the grid
3. Maps task priority to zone (high→must, medium→should, low→could)
4. Opens the EventEditor pre-filled with the task data and `linkedTaskId`

In the EventEditor save handler, include `linkedTaskId` in the onAdd call so the planner API creates the link.

- [ ] **Step 2: Update EventEditor to pass linkedTaskId through**

Add `linkedTaskId` to the EventData interface and pass it through onSave.

- [ ] **Step 3: Add visual indicator for linked items**

In the time block rendering, check if `item.linkedTaskId` exists and show a small checkbox icon.

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -5`

---

### Task 14: TaskItem — Make Draggable for Calendar

**Files:**
- Modify: `src/components/tasks/TaskItem.tsx`

- [ ] **Step 1: Add drag data transfer**

Update the `onDragStart` handler to set dataTransfer with task data:

```typescript
onDragStart={(e) => {
  e.dataTransfer.setData("application/cove-task", JSON.stringify({
    id: task.id,
    title: task.title,
    priority: task.priority,
  }));
  onDragStart?.();
}}
```

- [ ] **Step 2: Add calendar link indicator**

If the task has any linked planner items (passed as a prop or checked via an API), show a small calendar icon with the scheduled time.

- [ ] **Step 3: Verify build and test drag-to-calendar flow**

Run: `npx next build 2>&1 | tail -5`
Test: Drag a task from sidebar → drop on week calendar → EventEditor opens → save → linked time block appears.

---

## Post-Implementation

- [ ] **Run full test suite**: `npx vitest run`
- [ ] **Manual testing checklist**:
  - Create task in inbox → appears in Inbox tab
  - Move task to Today → appears in sidebar and Today tab
  - Defer task to tomorrow → disappears from Today, appears in Upcoming
  - Won't Do a task → moves to Done with reason
  - Break down a task → sub-tasks appear nested
  - Complete all sub-tasks → parent auto-completes
  - Drag task to calendar → linked time block appears
  - Complete time block → task completes with XP
  - Complete task → time block shows strikethrough
  - Overdue task → appears in "Needs attention" without red
