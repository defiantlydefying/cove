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
  const body = await request.json();

  if (!body.reason || typeof body.reason !== "string" || !body.reason.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const routine = await prisma.communityRoutine.findUnique({ where: { id } });
  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.communityReport.create({
    data: {
      userId: session.user.id,
      communityRoutineId: id,
      reason: body.reason.trim(),
    },
  });

  // Auto-hide if 3+ reports
  const reportCount = await prisma.communityReport.count({
    where: { communityRoutineId: id },
  });

  if (reportCount >= 3) {
    await prisma.communityRoutine.update({
      where: { id },
      data: { hidden: true },
    });
  }

  return NextResponse.json({ reported: true });
}
