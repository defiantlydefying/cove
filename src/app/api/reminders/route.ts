import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        title: body.title.trim(),
        message: body.message ?? null,
        type: body.type ?? "custom",
        schedule: body.schedule ?? null,
        enabled: body.enabled ?? true,
        scheduledTime: body.scheduledTime ?? null,
        intervalMinutes: body.intervalMinutes != null ? Number(body.intervalMinutes) : null,
        activeDays: body.activeDays ?? "0,1,2,3,4,5,6",
        presetKey: body.presetKey ?? null,
        soundEnabled: body.soundEnabled ?? true,
        notifyEnabled: body.notifyEnabled ?? true,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Reminder creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
