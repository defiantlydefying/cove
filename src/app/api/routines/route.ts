import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routines = await prisma.routine.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      logs: {
        where: { date: today },
        take: 1,
      },
    },
  });

  const result = routines.map((routine) => ({
    ...routine,
    todayLog: routine.logs[0] ?? null,
    logs: undefined,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const rawSteps: (string | { title: string })[] = body.steps ?? [];

  const routine = await prisma.$transaction(async (tx) => {
    const created = await tx.routine.create({
      data: {
        userId: session.user!.id,
        name: body.name.trim(),
        schedule: body.schedule ?? null,
      },
    });

    if (rawSteps.length > 0) {
      await tx.routineStep.createMany({
        data: rawSteps.map((step, index) => ({
          routineId: created.id,
          title: typeof step === "string" ? step : step.title,
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
