import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a task breakdown assistant for people who struggle with executive function. Given a task title and optional description, break it into smaller, actionable sub-steps.

Rules:
- Each step must start with a verb (action word)
- Steps should be specific and concrete, not vague
- Adjust the number of steps based on the granularity level:
  - Level 1: 3-4 broad steps
  - Level 2: 4-6 steps with some detail
  - Level 3: 5-8 detailed steps
  - Level 4: 8-12 specific steps
  - Level 5: 10-15 micro-steps (very granular, for when starting feels impossible)

Return JSON: { "steps": [{ "title": "Step description" }] }`;

const MOCK_STEPS = [
  { title: "Gather everything you need" },
  { title: "Set a timer for 15 minutes" },
  { title: "Start with the easiest part" },
  { title: "Take a short break if needed" },
  { title: "Finish the remaining pieces" },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; description?: string; granularity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const granularity = Math.min(5, Math.max(1, body.granularity ?? 3));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ steps: MOCK_STEPS });
  }

  try {
    const prompt = `Break down this task into sub-steps at granularity level ${granularity}/5:

Task: ${body.title.trim()}${body.description ? `\nDetails: ${body.description.trim()}` : ""}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch
      ? jsonMatch[0]
      : text.replace(/^```(?:json)?\s*\n?/gi, "").replace(/\n?```\s*$/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.steps)) {
      throw new Error("Unexpected response structure");
    }

    return NextResponse.json({
      steps: parsed.steps.map((s: { title: string }) => ({ title: s.title })),
    });
  } catch (error) {
    console.error("Task breakdown failed:", error);
    return NextResponse.json({ steps: MOCK_STEPS });
  }
}
