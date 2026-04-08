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

  const routine = await prisma.communityRoutine.findUnique({ where: { id } });
  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.communityHelpful.findUnique({
    where: { userId_communityRoutineId: { userId: session.user.id, communityRoutineId: id } },
  });

  if (existing) {
    // Remove helpful
    await prisma.communityHelpful.delete({ where: { id: existing.id } });
    await prisma.communityRoutine.update({
      where: { id },
      data: { helpfulCount: { decrement: 1 } },
    });
    return NextResponse.json({ helpful: false });
  } else {
    // Add helpful
    await prisma.communityHelpful.create({
      data: { userId: session.user.id, communityRoutineId: id },
    });
    await prisma.communityRoutine.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });
    return NextResponse.json({ helpful: true });
  }
}
