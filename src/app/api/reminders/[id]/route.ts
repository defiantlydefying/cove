import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.message !== undefined) data.message = body.message;
  if (body.type !== undefined) data.type = body.type;
  if (body.schedule !== undefined) data.schedule = body.schedule;
  if (body.enabled !== undefined) data.enabled = body.enabled;
  if (body.snoozedUntil !== undefined) {
    data.snoozedUntil = body.snoozedUntil
      ? new Date(body.snoozedUntil)
      : null;
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reminder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reminder.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
