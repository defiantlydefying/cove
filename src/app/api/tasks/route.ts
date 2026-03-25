import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id, parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  const subtasks = await prisma.task.findMany({
    where: { userId: session.user.id, parentId: { not: null } },
    orderBy: { sortOrder: "asc" },
  });

  const subtasksByParent = new Map<string, typeof subtasks>();
  for (const subtask of subtasks) {
    const list = subtasksByParent.get(subtask.parentId!) ?? [];
    list.push(subtask);
    subtasksByParent.set(subtask.parentId!, list);
  }

  const tasksWithSubtasks = tasks.map((task) => ({
    ...task,
    subtasks: subtasksByParent.get(task.id) ?? [],
  }));

  return NextResponse.json(tasksWithSubtasks);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
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
      isRecurring: body.isRecurring ?? false,
      recurrenceRule: body.recurrenceRule ?? null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
