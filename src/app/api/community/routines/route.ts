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
  const tags = searchParams.getAll("tag");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where: Record<string, unknown> = { hidden: false };
  if (tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  const [routines, total] = await Promise.all([
    prisma.communityRoutine.findMany({
      where,
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        helpfuls: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
      orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.communityRoutine.count({ where }),
  ]);

  const result = routines.map((r) => ({
    ...r,
    userHelpful: r.helpfuls.length > 0,
    helpfuls: undefined,
    isOwn: r.authorId === session.user.id,
  }));

  return NextResponse.json({ routines: result, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!body.displayName || typeof body.displayName !== "string" || !body.displayName.trim()) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  const steps: { title: string; durationMinutes?: number }[] = body.steps ?? [];
  if (steps.length === 0) {
    return NextResponse.json({ error: "At least one step is required" }, { status: 400 });
  }

  try {
    // Save display name to user if not already set
    await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: body.displayName.trim() },
    });

    const routine = await prisma.communityRoutine.create({
      data: {
        authorId: session.user.id,
        displayName: body.displayName.trim(),
        authorNote: body.authorNote?.trim() || null,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        startTime: body.startTime ?? null,
        showTimes: body.showTimes ?? false,
        showDurations: body.showDurations ?? true,
        tags: body.tags ?? [],
        steps: {
          create: steps.map((step, index) => ({
            title: typeof step === "string" ? step : step.title,
            durationMinutes: typeof step === "string" ? null : (step.durationMinutes ?? null),
            sortOrder: index,
          })),
        },
      },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error("Community publish failed:", error);
    return NextResponse.json({ error: "Failed to publish routine" }, { status: 500 });
  }
}
