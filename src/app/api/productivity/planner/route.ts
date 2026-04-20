import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");
  const dateParam = req.nextUrl.searchParams.get("date");

  let where: { userId: string; date?: Date | { gte: Date; lte: Date } } = { userId: user.id };

  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(endDate) };
  } else {
    const d = dateParam || new Date().toISOString().split("T")[0];
    where.date = new Date(d);
  }

  const items = await prisma.plannerItem.findMany({
    where,
    orderBy: [{ date: "asc" }, { zone: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, date, zone, startTime, endTime, taskId, linkedTaskId } = body;

  const dateVal = new Date(date || new Date().toISOString().split("T")[0]);

  const maxOrder = await prisma.plannerItem.findFirst({
    where: { userId: user.id, date: dateVal, zone: zone || "must" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.plannerItem.create({
    data: {
      userId: user.id,
      title,
      date: dateVal,
      zone: zone || "must",
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      startTime: startTime || null,
      endTime: endTime || null,
      taskId: taskId || null,
      linkedTaskId: linkedTaskId || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { id, ...updates } = body;

  const item = await prisma.plannerItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.plannerItem.update({
    where: { id },
    data: updates,
  });

  // Sync linked task when planner item is completed
  if (updates.completed && updated.linkedTaskId) {
    try {
      const linkedTask = await prisma.task.findFirst({
        where: { id: updated.linkedTaskId, userId: user.id },
      });
      if (linkedTask && (linkedTask as Record<string, unknown>).status === "active") {
        await prisma.task.update({
          where: { id: updated.linkedTaskId },
          data: { status: "completed", completed: true, completedAt: new Date() },
        });
        const { recordActivity } = await import("@/lib/gamification");
        await recordActivity(user.id, "tasks").catch(() => {});
      }
    } catch { /* non-blocking */ }
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await req.json();

  const item = await prisma.plannerItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.plannerItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
