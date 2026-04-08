import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const communityRoutine = await prisma.communityRoutine.findUnique({
    where: { id },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });

  if (!communityRoutine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Create independent copy in user's routines
  const routine = await prisma.$transaction(async (tx) => {
    const created = await tx.routine.create({
      data: {
        userId: session.user!.id,
        name: communityRoutine.name,
        startTime: communityRoutine.startTime,
        showTimes: communityRoutine.showTimes,
        showDurations: communityRoutine.showDurations,
      },
    });

    if (communityRoutine.steps.length > 0) {
      await tx.routineStep.createMany({
        data: communityRoutine.steps.map((step, index) => ({
          routineId: created.id,
          title: step.title,
          durationMinutes: step.durationMinutes,
          sortOrder: index,
        })),
      });
    }

    return tx.routine.findUnique({
      where: { id: created.id },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return NextResponse.json(routine, { status: 201 });
}
