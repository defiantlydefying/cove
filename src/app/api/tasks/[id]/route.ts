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

  if (body.completed !== undefined) {
    data.completed = body.completed;
    if (body.completed && !existing.completed) {
      data.completedAt = new Date();
    } else if (!body.completed) {
      data.completedAt = null;
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
  });

  // Record gamification activity when a task is completed
  let gamification = null;
  if (body.completed && !existing.completed) {
    try {
      gamification = await recordActivity(session.user.id, "tasks");
    } catch { /* non-blocking */ }
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
