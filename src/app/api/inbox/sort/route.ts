import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inboxItem.findMany({
    where: { userId: session.user.id, status: "unprocessed" },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  if (items.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const itemList = items.map((item, i) => `${i + 1}. "${item.content}"`).join("\n");

  const prompt = `You are helping organize a brain dump for a neurodivergent user. For each item below, suggest what it should become. Be generous and helpful.

Items:
${itemList}

Respond with ONLY a JSON array where each element has:
- "index": the item number (1-based)
- "category": one of "task", "reminder", "routine", or "note"
- "reason": a short friendly explanation (under 15 words)
- "suggestedTitle": a clean, actionable title if it's a task/reminder (or null for notes)

Example: [{"index": 1, "category": "task", "reason": "Sounds like something to check off", "suggestedTitle": "Buy groceries"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }
    const suggestions = JSON.parse(jsonMatch[0]);

    const mapped = suggestions
      .map((s: { index: number; category: string; reason: string; suggestedTitle: string | null }) => ({
        itemId: items[s.index - 1]?.id,
        category: s.category,
        reason: s.reason,
        suggestedTitle: s.suggestedTitle,
      }))
      .filter((s: { itemId: string | undefined }) => s.itemId);

    return NextResponse.json({ suggestions: mapped });
  } catch {
    return NextResponse.json({ error: "AI sorting failed" }, { status: 500 });
  }
}
