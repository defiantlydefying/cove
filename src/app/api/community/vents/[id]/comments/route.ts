import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const comments = await prisma.ventComment.findMany({
    where: { ventId: id },
    include: {
      author: { select: { displayName: true, avatarKey: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = comments.map((c) => ({
    id: c.id,
    body: c.body,
    displayName: c.author.displayName,
    avatarKey: c.author.avatarKey,
    createdAt: c.createdAt.toISOString(),
    isOwn: c.authorId === session.user.id,
  }));

  return NextResponse.json(result);
}

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

  if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }

  if (body.body.trim().length > 500) {
    return NextResponse.json({ error: "Comment must be 500 characters or less" }, { status: 400 });
  }

  const vent = await prisma.vent.findUnique({ where: { id } });
  if (!vent || vent.expiresAt < new Date() || vent.hidden) {
    return NextResponse.json({ error: "Vent not found or expired" }, { status: 404 });
  }

  const comment = await prisma.ventComment.create({
    data: {
      ventId: id,
      authorId: session.user.id,
      body: body.body.trim(),
    },
    include: {
      author: { select: { displayName: true, avatarKey: true } },
    },
  });

  return NextResponse.json({
    id: comment.id,
    body: comment.body,
    displayName: comment.author.displayName,
    avatarKey: comment.author.avatarKey,
    createdAt: comment.createdAt.toISOString(),
    isOwn: true,
  }, { status: 201 });
}
