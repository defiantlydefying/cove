import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowed: Record<string, unknown> = {};
  if (body.content !== undefined && typeof body.content === "string" && body.content.trim()) {
    allowed.content = body.content.trim();
  }
  if (body.status && ["unprocessed", "converted", "dismissed"].includes(body.status)) {
    allowed.status = body.status;
  }
  if (body.convertedTo) allowed.convertedTo = body.convertedTo;
  if (body.convertedId) allowed.convertedId = body.convertedId;

  const updated = await prisma.inboxItem.update({
    where: { id },
    data: allowed,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.inboxItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
