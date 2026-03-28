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

  const days = parseInt(req.nextUrl.searchParams.get("days") || "7", 10);
  const since = new Date(Date.now() - days * 86400000);

  const entries = await prisma.timeEntry.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { label, durationMin, date, taskId } = await req.json();
  const dateVal = new Date(date || new Date().toISOString().split("T")[0]);

  const created = await prisma.timeEntry.create({
    data: {
      userId: user.id,
      label,
      durationMin,
      date: dateVal,
      taskId: taskId || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
