import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const HIDE_THRESHOLD = 3;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.reason || typeof body.reason !== "string" || !body.reason.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const vent = await prisma.vent.findUnique({ where: { id } });
  if (!vent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.ventReport.findUnique({
    where: { userId_ventId: { userId: session.user.id, ventId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already reported" }, { status: 409 });
  }

  await prisma.ventReport.create({
    data: {
      ventId: id,
      userId: session.user.id,
      reason: body.reason.trim(),
    },
  });

  const updated = await prisma.vent.update({
    where: { id },
    data: { reportCount: { increment: 1 } },
  });

  if (updated.reportCount >= HIDE_THRESHOLD) {
    await prisma.vent.update({ where: { id }, data: { hidden: true } });
  }

  return NextResponse.json({ success: true });
}
