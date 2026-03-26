import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile || { age: null, conditions: [], medications: [], notes: null });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { age, conditions, medications, notes } = body;

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(age !== undefined && { age }),
      ...(conditions !== undefined && { conditions }),
      ...(medications !== undefined && { medications }),
      ...(notes !== undefined && { notes }),
    },
    create: {
      userId: session.user.id,
      age: age || null,
      conditions: conditions || [],
      medications: medications || [],
      notes: notes || null,
    },
  });

  return NextResponse.json(profile);
}
