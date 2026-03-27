import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildSystemPrompt(name: string, existingSteps: string[]): string {
  const stepsText =
    existingSteps.length > 0
      ? existingSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : "(no steps yet)";

  return (
    `You are helping build a routine called '${name}'. ` +
    `The user already has these steps:\n${stepsText}\n\n` +
    "Suggest 3-5 additional steps that would complement this routine. " +
    "Return ONLY a JSON array of strings. Keep steps short and actionable."
  );
}

const MOCK_SUGGESTIONS = [
  "Take a few deep breaths",
  "Set an intention for the day",
  "Check the weather",
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { routineName?: string; existingSteps?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    !body.routineName ||
    typeof body.routineName !== "string" ||
    !body.routineName.trim()
  ) {
    return NextResponse.json(
      { error: "routineName is required" },
      { status: 400 }
    );
  }

  const existingSteps = Array.isArray(body.existingSteps)
    ? body.existingSteps.filter((s): s is string => typeof s === "string")
    : [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: MOCK_SUGGESTIONS });
  }

  try {
    const systemPrompt = buildSystemPrompt(
      body.routineName.trim(),
      existingSteps
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(
      "Suggest additional steps for this routine."
    );
    const text = result.response.text();

    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as string[];

    if (
      !Array.isArray(parsed) ||
      parsed.some((s: unknown) => typeof s !== "string")
    ) {
      throw new Error("Unexpected response structure from AI");
    }

    return NextResponse.json({ suggestions: parsed });
  } catch (error) {
    console.error("Step suggestion failed:", error);
    return NextResponse.json(
      { error: "Failed to suggest steps. Please try again." },
      { status: 500 }
    );
  }
}
