import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const dateParam = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const date = new Date(dateParam);

  const items = await prisma.plannerItem.findMany({
    where: { userId: user.id, date },
    orderBy: [{ zone: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, date, zone, startTime, endTime, taskId } = body;

  const dateVal = new Date(date || new Date().toISOString().split("T")[0]);

  const maxOrder = await prisma.plannerItem.findFirst({
    where: { userId: user.id, date: dateVal, zone: zone || "must" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.plannerItem.create({
    data: {
      userId: user.id,
      title,
      date: dateVal,
      zone: zone || "must",
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      startTime: startTime || null,
      endTime: endTime || null,
      taskId: taskId || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { id, ...updates } = body;

  const item = await prisma.plannerItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.plannerItem.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await req.json();

  const item = await prisma.plannerItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.plannerItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
