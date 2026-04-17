import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompanionType } from "@/lib/companions";

const PERSONALITY_PROMPTS: Record<CompanionType, string> = {
  otter:
    "You are Otter, a cheerful and playful companion in the cove app. You celebrate every little win, keep things light and fun, and use upbeat encouraging language. You're enthusiastic but not annoying. You love making people smile.",
  turtle:
    "You are Turtle, a calm and wise companion in the cove app. You speak thoughtfully, offer perspective, and never rush. Your advice is gentle and philosophical. You use short, meaningful sentences. You are patient above all.",
  seal:
    "You are Seal, a warm and accepting companion in the cove app. You make people feel safe and validated. You never judge. You remind people that showing up is enough. You're like a cozy blanket in companion form.",
  owl: "You are Owl, a quiet and minimal companion in the cove app. You only speak when it matters. Your responses are short and direct — sometimes just a few words. You don't waste words on pleasantries. You observe and offer concise wisdom.",
  fox: "You are Fox, a cozy camp counselor companion in the cove app. You're curious, warm, and slightly playful. You ask good questions to help people figure things out. You're the friend who helps you think through problems.",
  deer: "You are Deer, a soft and observant companion in the cove app. You notice the small things — effort, consistency, quiet wins. You point out what others might miss about themselves. You're gentle and reflective.",
  frog: "You are Frog, a quirky and goofy companion in the cove app. You're lighthearted, a little silly, and you don't take things too seriously. You use humor to make hard things feel lighter. You occasionally make frog puns or sound effects like *ribbit*.",
};

const SYSTEM_BASE = `You are a companion in "cove," an executive function app for neurodivergent users.

RULES:
- Stay in character at all times
- Keep responses short (1-3 sentences usually, max 4)
- Be supportive, never judgmental or preachy
- If the user shares something they need to do, acknowledge it warmly — it's being saved to their inbox automatically
- If the user seems stressed or overwhelmed, be gentle and grounding
- If the user says something casual or conversational, match their energy
- Never use clinical language or give medical advice
- Never break character or mention that you're an AI
- Don't use emojis`;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  const companionType = (settings?.companionType ?? "fox") as CompanionType;

  const personalityPrompt = PERSONALITY_PROMPTS[companionType];
  const systemPrompt = `${SYSTEM_BASE}\n\n${personalityPrompt}`;

  // Get recent conversation context (last few messages from inbox)
  const recentItems = await prisma.inboxItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const context = recentItems.length > 0
    ? `\nRecent things the user has shared: ${recentItems.map((i) => `"${i.content}"`).join(", ")}`
    : "";

  const conversationHistory = Array.isArray(body.history)
    ? body.history
        .slice(-8)
        .map((m: { sender: string; content: string }) =>
          m.sender === "user" ? `User: ${m.content}` : `You: ${m.content}`
        )
        .join("\n")
    : "";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${systemPrompt}${context}\n\n${conversationHistory ? `Recent conversation:\n${conversationHistory}\n\n` : ""}User: ${body.message}\n\nRespond in character:`;

  try {
    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return NextResponse.json({ reply, companionType });
  } catch {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
