import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCompanionCopy, type CopyContext } from "@/lib/companionCopy";
import type { CompanionType } from "@/lib/companions";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  const companionType = (settings?.companionType ?? "fox") as CompanionType;

  const hour = new Date().getHours();
  let timeContext: CopyContext;
  if (hour < 12) timeContext = "greeting_morning";
  else if (hour < 17) timeContext = "greeting_afternoon";
  else timeContext = "greeting_evening";

  const lastActivity = await prisma.inboxItem.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  let gapContext: CopyContext | null = null;
  if (lastActivity) {
    const daysSince = Math.floor(
      (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 8) gapContext = "greeting_return_long";
    else if (daysSince >= 4) gapContext = "greeting_return_short";
  } else {
    const lastTask = await prisma.task.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (lastTask) {
      const daysSince = Math.floor(
        (Date.now() - lastTask.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 8) gapContext = "greeting_return_long";
      else if (daysSince >= 4) gapContext = "greeting_return_short";
    }
  }

  const context = gapContext ?? timeContext;
  const greeting = getCompanionCopy(companionType, context);

  const unprocessedCount = await prisma.inboxItem.count({
    where: { userId: session.user.id, status: "unprocessed" },
  });

  return NextResponse.json({
    greeting,
    companionType,
    unprocessedCount,
  });
}
