import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateRandomName } from "@/lib/randomName";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newName = generateRandomName();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: newName },
  });

  return NextResponse.json({ displayName: newName });
}
