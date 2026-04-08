import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You are a scheduling assistant for Cove, a wellness reminder app for neurodivergent users. " +
  "Parse the user's natural language schedule description into structured JSON. " +
  "Return ONLY a JSON object with these fields: " +
  '{ "title": string (a short name for the reminder if described), ' +
  '"scheduledTime": string in "HH:MM" 24-hour format (the start time), ' +
  '"intervalMinutes": number or null (null = once per day, otherwise repeat interval in minutes), ' +
  '"activeDays": string of comma-separated day indices where 0=Sunday, 1=Monday, ..., 6=Saturday, ' +
  '"type": one of "custom", "hydration", "break", "medication", "self-care" }. ' +
  "Examples: " +
  '"every 2 hours on weekdays starting at 9am" -> {"scheduledTime":"09:00","intervalMinutes":120,"activeDays":"1,2,3,4,5","type":"custom"} ' +
  '"daily at 10pm" -> {"scheduledTime":"22:00","intervalMinutes":null,"activeDays":"0,1,2,3,4,5,6","type":"custom"} ' +
  '"take meds every morning at 8" -> {"title":"Take Medication","scheduledTime":"08:00","intervalMinutes":null,"activeDays":"0,1,2,3,4,5,6","type":"medication"}';

const MOCK_RESPONSE = {
  title: "Custom Reminder",
  scheduledTime: "09:00",
  intervalMinutes: null,
  activeDays: "0,1,2,3,4,5,6",
  type: "custom",
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
      { error: "A schedule description is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(MOCK_RESPONSE);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: body.prompt.trim() }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch
      ? jsonMatch[0]
      : text.replace(/^```(?:json)?\s*\n?/gi, "").replace(/\n?```\s*$/gi, "").trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      title: parsed.title ?? null,
      scheduledTime: parsed.scheduledTime ?? "09:00",
      intervalMinutes: parsed.intervalMinutes ?? null,
      activeDays: parsed.activeDays ?? "0,1,2,3,4,5,6",
      type: parsed.type ?? "custom",
    });
  } catch (error) {
    console.error("Schedule parsing failed:", error);
    return NextResponse.json(MOCK_RESPONSE);
  }
}
