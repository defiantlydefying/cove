// Crisis detection + escalation for the AI companion.
//
// Why this exists: Cove's companion is an emotional-support chatbot used by a
// vulnerable, partly-minor audience. When a user expresses thoughts of self-harm,
// suicide, or being in immediate danger, the safe behavior is NOT to let an LLM
// improvise — it's to respond with a fixed, compassionate message and surface real
// crisis resources. This module powers that backstop. It is intentionally
// conservative: false positives (showing resources when not strictly needed) are
// acceptable; false negatives are not.

export interface CrisisResource {
  name: string;
  contact: string;
  detail: string;
  href?: string;
}

// US-focused defaults. If/when Cove localizes, branch these by user locale.
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    detail: "Free, confidential, 24/7 support (US).",
    href: "tel:988",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    detail: "Talk to a trained crisis counselor by text (US).",
    href: "sms:741741",
  },
  {
    name: "Emergency services",
    contact: "Call 911",
    detail: "If you or someone else is in immediate danger.",
    href: "tel:911",
  },
  {
    name: "Find a Helpline (international)",
    contact: "findahelpline.com",
    detail: "Free, confidential support lines worldwide.",
    href: "https://findahelpline.com",
  },
];

// Patterns that indicate possible self-harm / suicidal ideation / immediate danger.
// Word boundaries and short phrases reduce obvious false matches (e.g. "I could kill
// for a coffee" is excluded via the negative-context check below).
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill (?:myself|me)\b/i,
  /\bkilling myself\b/i,
  /\b(?:end|ending) (?:my|it all|my life)\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\btake my (?:own )?life\b/i,
  /\b(?:don'?t|do not) want to (?:be alive|live|wake up|exist)\b/i,
  /\b(?:want|wanting|going) to die\b/i,
  /\bbetter off (?:dead|without me)\b/i,
  /\bno reason to (?:live|go on)\b/i,
  /\b(?:hurt|harm|cut|cutting) (?:myself|my self)\b/i,
  /\bself[- ]harm\b/i,
  /\bi (?:can'?t|cannot) (?:go on|do this anymore|keep going)\b/i,
  /\bi(?:'?m| am) going to end it\b/i,
  /\boverdose\b/i,
];

// Phrases that look risky but are usually idiomatic/benign. Used to suppress the
// most common false positives without weakening true detection.
const BENIGN_CONTEXT: RegExp[] = [
  /\bcould kill for\b/i,
  /\bkill(?:ing)? time\b/i,
  /\bkill it\b/i, // "I'm gonna kill it at the interview"
  /\bdead tired\b/i,
  /\bdying to\b/i, // "dying to see it"
  /\bdying laughing\b/i,
];

/**
 * Returns true if the message likely indicates a self-harm / crisis situation.
 * Conservative by design — prefers surfacing help over missing a real crisis.
 */
export function detectCrisis(message: string): boolean {
  if (!message) return false;
  const text = message.toLowerCase();

  if (BENIGN_CONTEXT.some((re) => re.test(text)) && !/\bsuicid|kill myself|end my life|self[- ]harm\b/i.test(text)) {
    // Idiomatic usage with no hard crisis term present.
    return false;
  }

  return CRISIS_PATTERNS.some((re) => re.test(text));
}

// Fixed, compassionate response used INSTEAD of the LLM when a crisis is detected.
// Keep it warm, non-clinical, non-judgmental, and clear that help is available.
export const CRISIS_REPLY =
  "I'm really glad you told me, and I'm so sorry you're feeling this much pain right now. " +
  "I care about you, but I'm an AI companion and not able to keep you safe on my own — " +
  "please reach out to someone who can be there with you right now. You don't have to go through this alone.";
