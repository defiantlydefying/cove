import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      logs: {
        where: { date: today },
        take: 1,
      },
    },
  });

  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...routine,
    todayLog: routine.logs[0] ?? null,
    logs: undefined,
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.schedule !== undefined) data.schedule = body.schedule;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.routine.update({ where: { id }, data });

    if (body.steps !== undefined) {
      await tx.routineStep.deleteMany({ where: { routineId: id } });

      const steps: { title: string }[] = body.steps;
      if (steps.length > 0) {
        await tx.routineStep.createMany({
          data: steps.map((step, index) => ({
            routineId: id,
            title: step.title,
            sortOrder: index,
          })),
        });
      }
    }

    return tx.routine.findUnique({
      where: { id },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.routineStep.deleteMany({ where: { routineId: id } });
    await tx.routineLog.deleteMany({ where: { routineId: id } });
    await tx.routine.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
