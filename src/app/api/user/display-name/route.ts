import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true },
  });

  return NextResponse.json({ displayName: user?.displayName ?? null });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const displayName = body.displayName?.trim();

  if (!displayName || displayName.length < 3 || displayName.length > 30) {
    return NextResponse.json(
      { error: "Display name must be 3-30 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
    return NextResponse.json(
      { error: "Display name can only contain letters, numbers, and underscores" },
      { status: 400 }
    );
  }

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { displayName, id: { not: session.user.id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "That display name is already taken" },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName },
  });

  return NextResponse.json({ displayName });
}
