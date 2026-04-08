import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const routine = await prisma.communityRoutine.findFirst({
    where: { id, authorId: session.user.id },
  });

  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.communityRoutine.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
