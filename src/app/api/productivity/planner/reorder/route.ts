import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { items } = await req.json();

  await prisma.$transaction(
    items.map((item: { id: string; sortOrder: number; zone?: string }) =>
      prisma.plannerItem.update({
        where: { id: item.id },
        data: {
          sortOrder: item.sortOrder,
          ...(item.zone ? { zone: item.zone } : {}),
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
