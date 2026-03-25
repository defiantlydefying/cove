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

  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  if (!Array.isArray(body.completedSteps)) {
    return NextResponse.json(
      { error: "completedSteps must be an array" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await prisma.routineLog.upsert({
    where: {
      routineId_date: {
        routineId: id,
        date: today,
      },
    },
    create: {
      routineId: id,
      date: today,
      completedSteps: body.completedSteps,
    },
    update: {
      completedSteps: body.completedSteps,
    },
  });

  return NextResponse.json(log);
}
