export type CompanionType = "otter" | "turtle" | "seal" | "owl" | "fox" | "deer" | "frog";

export interface Companion {
  type: CompanionType;
  name: string;
  emoji: string;
  habitat: "coastal" | "forest" | "both";
  personality: string;
  tagline: string;
  sampleQuote: string;
}

export const COMPANIONS: Companion[] = [
  {
    type: "otter",
    name: "Otter",
    emoji: "\uD83E\uDDA6",
    habitat: "coastal",
    personality: "Cheerful buddy",
    tagline: "Playful, celebrates wins, keeps things light",
    sampleQuote: "You did the thing! Tiny victory dance!",
  },
  {
    type: "turtle",
    name: "Turtle",
    emoji: "\uD83D\uDC22",
    habitat: "coastal",
    personality: "Calm sage",
    tagline: "Wise, thoughtful, drops insights when it matters",
    sampleQuote: "Sometimes the smallest step is the bravest one.",
  },
  {
    type: "seal",
    name: "Seal",
    emoji: "\uD83E\uDDAD",
    habitat: "coastal",
    personality: "Warm & accepting",
    tagline: "Easygoing, validating, makes you feel at home",
    sampleQuote: "Hey, you're here. That's already enough.",
  },
  {
    type: "owl",
    name: "Owl",
    emoji: "\uD83E\uDD89",
    habitat: "forest",
    personality: "Quiet librarian",
    tagline: "Minimal, only speaks when it matters",
    sampleQuote: "You're back. Let's begin.",
  },
  {
    type: "fox",
    name: "Fox",
    emoji: "\uD83E\uDD8A",
    habitat: "forest",
    personality: "Cozy camp counselor",
    tagline: "Curious, warm, slightly playful",
    sampleQuote: "What's on your mind today? Let's figure it out together.",
  },
  {
    type: "deer",
    name: "Deer",
    emoji: "\uD83E\uDD8C",
    habitat: "forest",
    personality: "Soft & observant",
    tagline: "Notices small things, reflective, quietly validating",
    sampleQuote: "I noticed you've been showing up more this week. That matters.",
  },
  {
    type: "frog",
    name: "Frog",
    emoji: "\uD83D\uDC38",
    habitat: "both",
    personality: "Quirky & goofy",
    tagline: "Lighthearted, low-pressure, a little silly",
    sampleQuote: "One hop at a time, friend.",
  },
];

export function getCompanion(type: CompanionType): Companion {
  return COMPANIONS.find((c) => c.type === type) ?? COMPANIONS[4]; // default fox
}
