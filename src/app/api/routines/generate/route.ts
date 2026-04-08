import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You are a helpful assistant for Cove, a planner app for neurodivergent users. " +
  "Generate a daily routine based on the user's request. " +
  "Return ONLY a JSON object with this exact structure: { name: string, steps: { time: string, title: string, duration: string }[] }. " +
  "Each step must have a 'time' (e.g. '6:10 AM'), a 'title' (short actionable description), and a 'duration' (e.g. '5 min', '10 min', '15 min'). " +
  "If the user mentions a wake-up time or start time, use that as the starting point and schedule steps sequentially from there. " +
  "The routine should be practical, gentle, and realistic for neurodivergent users. " +
  "Maximum 10 steps.";

const MOCK_RESPONSE = {
  name: "Morning Routine",
  steps: [
    "6:10 AM - Turn off alarm and take a deep breath (2 min)",
    "6:12 AM - Drink a glass of water (2 min)",
    "6:14 AM - Gentle stretching (5 min)",
    "6:19 AM - Wash face and brush teeth (5 min)",
    "6:24 AM - Get dressed (5 min)",
    "6:29 AM - Eat a simple breakfast (15 min)",
    "6:44 AM - Review your to-do list (5 min)",
    "6:49 AM - Take any morning medications (1 min)",
    "6:50 AM - Pack what you need for the day (10 min)",
  ],
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(MOCK_RESPONSE);
  }

  try {
    // Optionally fetch the user's profile for personalization
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    let userContext = body.prompt.trim();
    if (profile?.conditions && profile.conditions.length > 0) {
      userContext += `\n\nUser context: The user has the following conditions: ${profile.conditions.join(", ")}.`;
    }
    if (profile?.age) {
      userContext += ` Age: ${profile.age}.`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userContext }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const text = result.response.text();

    // Strip markdown code fences and any non-JSON text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : text.replace(/^```(?:json)?\s*\n?/gi, "").replace(/\n?```\s*$/gi, "").trim();

    const parsed = JSON.parse(cleaned) as {
      name: string;
      steps: { time: string; title: string; duration: string }[] | string[];
    };

    if (typeof parsed.name !== "string" || !Array.isArray(parsed.steps)) {
      throw new Error("Unexpected response structure from AI");
    }

    // Normalize steps: if AI returned objects with time/title/duration, format them as strings
    const formattedSteps = parsed.steps.map((s: unknown) => {
      if (typeof s === "string") return s;
      if (typeof s === "object" && s !== null) {
        const step = s as { time?: string; title?: string; duration?: string };
        const parts: string[] = [];
        if (step.time) parts.push(step.time);
        if (step.title) parts.push(step.title);
        if (step.duration) parts.push(`(${step.duration})`);
        return parts.join(" - ") || JSON.stringify(s);
      }
      return String(s);
    });

    return NextResponse.json({ name: parsed.name, steps: formattedSteps });
  } catch (error) {
    console.error("Routine generation failed:", error);
    // Fall back to mock response instead of failing
    return NextResponse.json(MOCK_RESPONSE);
  }
}
