import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  // Build where conditions
  const conditions: Record<string, unknown>[] = [
    { userId: session.user.id },
    { parentId: null },
  ];

  // Hide deferred tasks: only show where deferredUntil is null or <= today
  conditions.push({
    OR: [
      { deferredUntil: null },
      { deferredUntil: { lte: endOfToday } },
    ],
  });

  if (stage === "done") {
    conditions.push({ status: { in: ["completed", "wont_do"] } });
  } else if (stage) {
    conditions.push({ stage });
    conditions.push({ status: "active" });
  } else {
    conditions.push({ status: "active" });
  }

  if (search) {
    conditions.push({ title: { contains: search, mode: "insensitive" } });
  }

  const tasks = await prisma.task.findMany({
    where: { AND: conditions },
    orderBy: { sortOrder: "asc" },
    include: {
      subtasks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(tasks);
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

  // Auto-assign stage from scheduledDate
  let stage = body.stage ?? "inbox";
  if (body.scheduledDate) {
    const scheduled = new Date(body.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDay = new Date(scheduled);
    scheduledDay.setHours(0, 0, 0, 0);

    if (scheduledDay.getTime() === today.getTime()) {
      stage = "today";
    } else if (scheduledDay > today) {
      stage = "upcoming";
    }
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
      stage,
      scheduledDate: body.scheduledDate
        ? new Date(body.scheduledDate)
        : null,
    },
    include: {
      subtasks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
