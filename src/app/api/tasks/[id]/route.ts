import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordActivity } from "@/lib/gamification";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const subtasks = await prisma.task.findMany({
    where: { parentId: task.id, userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ ...task, subtasks });
}

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

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.deadline !== undefined)
    data.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.energyLevel !== undefined) data.energyLevel = body.energyLevel;
  if (body.parentId !== undefined) data.parentId = body.parentId;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.isRecurring !== undefined) data.isRecurring = body.isRecurring;
  if (body.recurrenceRule !== undefined)
    data.recurrenceRule = body.recurrenceRule;
  if (body.deferredUntil !== undefined)
    data.deferredUntil = body.deferredUntil
      ? new Date(body.deferredUntil)
      : null;

  // A scheduled date is just a tag. Only pull a task OUT of the Inbox when it's
  // first scheduled — tasks already in a list (Today/Upcoming/Someday) keep their
  // place, so dating a Today task never makes it disappear.
  if (body.scheduledDate !== undefined) {
    data.scheduledDate = body.scheduledDate
      ? new Date(body.scheduledDate)
      : null;

    if (body.scheduledDate && existing.stage === "inbox") {
      const scheduled = new Date(body.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduledDay = new Date(scheduled);
      scheduledDay.setHours(0, 0, 0, 0);

      if (scheduledDay.getTime() === today.getTime()) {
        data.stage = "today";
      } else if (scheduledDay > today) {
        data.stage = "upcoming";
      }
    }
  }

  // Explicit stage override takes precedence
  if (body.stage !== undefined) {
    data.stage = body.stage;
  }

  // Determine effective status: support both new `status` field and legacy `completed` boolean
  let effectiveStatus: string | undefined;

  if (body.status !== undefined) {
    effectiveStatus = body.status;
  } else if (body.completed !== undefined && body.status === undefined) {
    // Backwards compat: map legacy `completed` boolean to status
    effectiveStatus = body.completed ? "completed" : "active";
  }

  if (effectiveStatus !== undefined) {
    data.status = effectiveStatus;

    if (
      (effectiveStatus === "completed" || effectiveStatus === "wont_do") &&
      existing.status !== "completed" &&
      existing.status !== "wont_do"
    ) {
      data.completed = true;
      data.completedAt = new Date();
      if (effectiveStatus === "wont_do" && body.completedReason !== undefined) {
        data.completedReason = body.completedReason;
      }
    } else if (
      effectiveStatus === "active" &&
      (existing.status === "completed" || existing.status === "wont_do")
    ) {
      data.completed = false;
      data.completedAt = null;
      data.completedReason = null;
    }
  }

  // Accept completedReason even outside status transition if explicitly provided
  if (
    body.completedReason !== undefined &&
    effectiveStatus === undefined
  ) {
    data.completedReason = body.completedReason;
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
  });

  // Determine if task was just completed or marked wont_do
  const justCompleted =
    (effectiveStatus === "completed" || effectiveStatus === "wont_do") &&
    existing.status !== "completed" &&
    existing.status !== "wont_do";

  // Record gamification activity when a task is completed
  let gamification = null;
  if (justCompleted) {
    try {
      gamification = await recordActivity(session.user.id, "tasks");
    } catch {
      /* non-blocking */
    }

    // Sync linked planner items (linkedTaskId field may not exist yet)
    try {
      await (prisma.plannerItem as any).updateMany({
        where: { linkedTaskId: id },
        data: { completed: true },
      });
    } catch {
      /* linkedTaskId field may not exist yet */
    }
  }

  return NextResponse.json({ ...updated, gamification });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
