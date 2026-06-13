import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompanionType } from "@/lib/companions";

const PERSONALITY_HINTS: Record<CompanionType, string> = {
  otter: "You're cheerful — celebrate that they found a shortcut!",
  turtle: "You're calm — reassure them everything is captured.",
  seal: "You're warm — make them feel like this was a great idea.",
  owl: "You're concise — brief acknowledgment.",
  fox: "You're curious and warm — acknowledge their smart approach.",
  deer: "You're gentle — notice the effort to stay organized.",
  frog: "You're quirky — make a light comment about the screenshot.",
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.image || typeof body.image !== "string") {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  const companionType = (settings?.companionType ?? "fox") as CompanionType;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Extract base64 data and mime type
  const match = body.image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const prompt = `You are helping a neurodivergent student organize their schoolwork. Look at this screenshot and extract ALL tasks, assignments, due dates, and important information.

Rules:
- Extract every assignment, task, quiz, exam, or deadline visible
- Include the course/class name if visible
- Include due dates and times exactly as shown
- If points or grade weight is shown, include it
- Make each item actionable (e.g., "Submit Math 201 Problem Set 4" not just "Problem Set 4")
- If you see multiple items, list them ALL — don't summarize
- If the image is not a school/task screenshot, still try to extract any actionable items or information
- If you truly can't find anything useful, return an empty items array

Respond with ONLY a JSON object:
- "items": array where each element has:
  - "content": actionable task description including course name if available
  - "category": "task" or "reminder"
  - "dueDate": ISO date string if a date is visible (use current year 2026 if year not shown), otherwise null
  - "priority": "high" if it's due within 2 days or is an exam/test, "medium" otherwise
- "summary": a short (1-2 sentence) companion message about what you found. ${PERSONALITY_HINTS[companionType]} Don't use emojis.
- "source": what app/platform this looks like (e.g., "Canvas", "Blackboard", "Google Classroom", "syllabus", "unknown")`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const summary = typeof parsed.summary === "string" ? parsed.summary : "I found some items in your screenshot.";
    const source = typeof parsed.source === "string" ? parsed.source : "unknown";

    return NextResponse.json({ items, summary, source, companionType });
  } catch {
    return NextResponse.json({ error: "Image extraction failed" }, { status: 500 });
  }
}
