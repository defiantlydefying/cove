import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordActivity } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const checkins = await prisma.wellnessCheckin.findMany({
    where: {
      userId: session.user.id,
      date: { gte: since },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(checkins);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkin = await prisma.wellnessCheckin.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
    update: {
      mood: body.mood ?? undefined,
      energy: body.energy ?? undefined,
      sleep: body.sleep ?? undefined,
      notes: body.notes ?? undefined,
    },
    create: {
      userId: session.user.id,
      date: today,
      mood: body.mood ?? null,
      energy: body.energy ?? null,
      sleep: body.sleep ?? null,
      notes: body.notes ?? null,
    },
  });

  recordActivity(session.user.id, "wellness").catch(() => {});

  return NextResponse.json(checkin, { status: 200 });
}
