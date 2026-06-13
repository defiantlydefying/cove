import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateRandomName } from "@/lib/randomName";
import { getRandomStarterKey } from "@/lib/avatars";

const LIFESPAN_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "48h": 48 * 60 * 60 * 1000,
  "5d": 5 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const now = new Date();

  const [vents, total] = await Promise.all([
    prisma.vent.findMany({
      where: { hidden: false, expiresAt: { gt: now } },
      include: {
        author: { select: { displayName: true, avatarKey: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vent.count({ where: { hidden: false, expiresAt: { gt: now } } }),
  ]);

  const result = vents.map((v) => ({
    id: v.id,
    body: v.body,
    lifespan: v.lifespan,
    expiresAt: v.expiresAt.toISOString(),
    contactPreference: v.contactPreference,
    createdAt: v.createdAt.toISOString(),
    displayName: v.author.displayName,
    avatarKey: v.author.avatarKey,
    commentCount: v._count.comments,
    isOwn: v.authorId === session.user.id,
  }));

  return NextResponse.json({ vents: result, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Vent text is required" }, { status: 400 });
  }

  if (body.body.trim().length > 2000) {
    return NextResponse.json({ error: "Vent must be 2000 characters or less" }, { status: 400 });
  }

  const lifespan = body.lifespan as string;
  if (!LIFESPAN_MS[lifespan]) {
    return NextResponse.json({ error: "Invalid lifespan. Use: 24h, 48h, 5d, or 7d" }, { status: 400 });
  }

  const contactPreference = body.contactPreference ?? "both";
  if (!["dms", "anonymous_replies", "both"].includes(contactPreference)) {
    return NextResponse.json({ error: "Invalid contact preference" }, { status: 400 });
  }

  // Ensure user has a display name and avatar
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, avatarKey: true },
  });

  if (!user?.displayName) {
    const newName = generateRandomName();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: newName },
    });
  }

  if (!user?.avatarKey) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarKey: getRandomStarterKey() },
    });
  }

  const expiresAt = new Date(Date.now() + LIFESPAN_MS[lifespan]);

  const vent = await prisma.vent.create({
    data: {
      authorId: session.user.id,
      body: body.body.trim(),
      lifespan,
      expiresAt,
      contactPreference,
    },
  });

  return NextResponse.json(vent, { status: 201 });
}
