import { CompanionType } from "./companions";

export type CopyContext =
  | "intro"
  | "greeting_morning"
  | "greeting_afternoon"
  | "greeting_evening"
  | "greeting_return_short"
  | "greeting_return_long"
  | "capture_ack"
  | "inbox_nudge"
  | "task_complete"
  | "streak_update"
  | "achievement_unlock"
  | "empty_tasks"
  | "empty_routines"
  | "empty_inbox"
  | "sort_offer"
  | "sort_complete"
  | "error_generic";

const copy: Record<CompanionType, Record<CopyContext, string[]>> = {
  otter: {
    intro: [
      "Hey! I'm Otter. So glad you picked me!\n\nHere's the deal: I'm going to celebrate every little win with you. Big wins, tiny wins, 'I got out of bed' wins \u2014 all of them count. I'll help you keep things light. Ready to make some waves together?",
    ],
    greeting_morning: [
      "Good morning! Ready to make some waves today?",
      "Rise and shine! What are we tackling first?",
    ],
    greeting_afternoon: [
      "Hey hey! How's the day going so far?",
      "Afternoon check-in! You doing okay?",
    ],
    greeting_evening: [
      "Evening! Let's wind things down nicely.",
      "Hey! Almost made it through another day. Nice work!",
    ],
    greeting_return_short: [
      "You're back! I missed you. What's up?",
      "Hey, welcome back! Anything on your mind?",
    ],
    greeting_return_long: [
      "It's been a minute! No worries at all \u2014 I'm just happy to see you. Fresh start?",
      "Hey hey, long time no see! Everything's right where you left it. What do you need?",
    ],
    capture_ack: [
      "Got it! I'll hold onto that.",
      "Noted! Tucked away safe.",
      "On it! That's saved.",
    ],
    inbox_nudge: [
      "You've got some thoughts piling up \u2014 want to sort through them together?",
    ],
    task_complete: [
      "You did the thing! Tiny victory dance!",
      "Checked off! That feels good, right?",
    ],
    streak_update: ["Look at you go! Keep riding that wave!"],
    achievement_unlock: ["Whoa, you just unlocked something! Go you!"],
    empty_tasks: ["No tasks yet! Want to brain dump some ideas?"],
    empty_routines: ["No routines yet! Want me to help you build one?"],
    empty_inbox: ["Inbox is clear! Your brain must feel lighter."],
    sort_offer: [
      "Want me to help sort these out? I'll suggest where things could go.",
    ],
    sort_complete: [
      "All sorted! Take a look and tweak anything that doesn't feel right.",
    ],
    error_generic: ["Oops, something hiccuped. Try again?"],
  },
  turtle: {
    intro: [
      "Hello. I'm Turtle.\n\nI move slowly. So will we, when we need to. There's wisdom in pace \u2014 the rush isn't always the way. I'll be here when you need perspective, and quiet when you don't. Take your time settling in.",
    ],
    greeting_morning: [
      "Good morning. Take a breath. What matters today?",
      "A new day. No rush \u2014 let it unfold.",
    ],
    greeting_afternoon: [
      "The day is moving. How are you moving with it?",
      "Afternoon. A good time to check in with yourself.",
    ],
    greeting_evening: [
      "Evening. You've carried enough today. Set it down.",
      "The day is winding down. What went well?",
    ],
    greeting_return_short: [
      "Welcome back. Time away is not time wasted.",
      "Good to see you again. Pick up wherever feels right.",
    ],
    greeting_return_long: [
      "It's been a while. That's perfectly okay. The path is still here whenever you're ready.",
      "No rush. You're here now, and that's what matters. Want to start fresh?",
    ],
    capture_ack: [
      "Held.",
      "I'll remember that.",
      "Noted. It'll be here when you need it.",
    ],
    inbox_nudge: [
      "You have some thoughts saved up. When the time feels right, we can look through them.",
    ],
    task_complete: [
      "Done. Sometimes the smallest step is the bravest one.",
      "Completed. That took courage, even if it didn't feel like it.",
    ],
    streak_update: ["Consistency is quiet strength. You're building it."],
    achievement_unlock: [
      "A milestone. Take a moment to appreciate the journey here.",
    ],
    empty_tasks: ["Nothing on the list. Perhaps that's its own kind of peace."],
    empty_routines: [
      "No routines yet. When you're ready, we'll build something gentle.",
    ],
    empty_inbox: ["A clear mind. Enjoy the space."],
    sort_offer: ["Would you like help organizing these thoughts? No pressure."],
    sort_complete: ["Organized. Review at your own pace."],
    error_generic: ["Something didn't work. Let's try again, gently."],
  },
  seal: {
    intro: [
      "Hi, I'm Seal. I'm really glad you're here.\n\nI want you to know: you don't have to earn my company. You don't have to explain bad days. You don't have to be productive to deserve a break. I'm just happy you showed up. Whatever you need, I'm here.",
    ],
    greeting_morning: [
      "Morning! Just showing up is a win. How are you?",
      "Hey, good morning. You're doing great just being here.",
    ],
    greeting_afternoon: [
      "Hey! Hope your afternoon is treating you well.",
      "Checking in \u2014 you're doing fine, you know that right?",
    ],
    greeting_evening: [
      "Hey, you made it through today. That counts for a lot.",
      "Evening. Whatever you got done today? That's enough.",
    ],
    greeting_return_short: [
      "Hey, you're back! I'm glad. No judgment, just happy to see you.",
      "Welcome back! Everything's still here. Take your time.",
    ],
    greeting_return_long: [
      "It's been a little while \u2014 and that's completely okay. You don't have to explain. Want to start fresh?",
      "Hey, I've been here. No pressure, no catch-up needed. Just glad you're back.",
    ],
    capture_ack: [
      "Got it, friend. Safe with me.",
      "Heard. I'll keep that for you.",
      "Saved! Don't worry about it for now.",
    ],
    inbox_nudge: [
      "You've got some thoughts saved \u2014 want to look through them together? Only if you feel like it.",
    ],
    task_complete: [
      "Done! You should be proud of that.",
      "Look at you getting things done. Seriously, well done.",
    ],
    streak_update: ["You keep showing up. That's something to feel good about."],
    achievement_unlock: ["You earned this! Take a second to appreciate yourself."],
    empty_tasks: [
      "Nothing here yet \u2014 and that's totally fine. Drop something in when you're ready.",
    ],
    empty_routines: ["No routines yet. Want to build one together? No rush."],
    empty_inbox: ["All clear! Nothing hanging over you."],
    sort_offer: ["Want a hand sorting these? I'll do the heavy lifting."],
    sort_complete: ["All sorted! See how that feels."],
    error_generic: ["Hmm, that didn't quite work. No worries, let's try again."],
  },
  owl: {
    intro: [
      "I'm Owl.\n\nI don't talk much. I'll be here when it matters. When you need structure, I'll help. When you need quiet, I'll stay quiet. Begin whenever you're ready.",
    ],
    greeting_morning: ["Morning.", "A new day. Begin when ready."],
    greeting_afternoon: ["Afternoon.", "Midday. How goes it?"],
    greeting_evening: ["Evening. Rest approaches.", "Day's end. Review or rest."],
    greeting_return_short: ["You're back.", "Welcome. Pick up where you left off."],
    greeting_return_long: [
      "It's been a while. No matter. Fresh start available.",
      "Returned. Everything is as you left it.",
    ],
    capture_ack: ["Noted.", "Recorded.", "Stored."],
    inbox_nudge: ["Unprocessed items await your attention."],
    task_complete: ["Done.", "Complete. Next?"],
    streak_update: ["Consistent. Good."],
    achievement_unlock: ["Achievement unlocked."],
    empty_tasks: ["Empty. Add when ready."],
    empty_routines: ["No routines configured."],
    empty_inbox: ["Inbox clear."],
    sort_offer: ["Sort these?"],
    sort_complete: ["Sorted. Review."],
    error_generic: ["Error occurred. Retry."],
  },
  fox: {
    intro: [
      "Hey, I'm Fox! Nice to meet you.\n\nThink of me as your camp counselor through all this. I'm curious, I ask questions, and I'm always down to help you figure things out. Whenever you've got something rattling around in your head, just tell me about it \u2014 I'll help you sort through it. What do you want to start with?",
    ],
    greeting_morning: [
      "Good morning! What's on your mind today? Let's figure it out together.",
      "Hey, morning! I've got a good feeling about today.",
    ],
    greeting_afternoon: [
      "Afternoon! How's everything going? Need anything?",
      "Hey! Checking in \u2014 what can we work on together?",
    ],
    greeting_evening: [
      "Evening! Let's wrap up the day on a good note.",
      "Winding down? Let's see what we accomplished today.",
    ],
    greeting_return_short: [
      "Hey, welcome back! I've been keeping things tidy while you were away.",
      "You're back! Good to see you. What are we working on?",
    ],
    greeting_return_long: [
      "Hey! It's been a little while \u2014 no worries at all. Want to start fresh today?",
      "Welcome back, friend! I cleared the cobwebs. Ready when you are.",
    ],
    capture_ack: [
      "Got it! I'll hold onto that for you.",
      "Tucked away! We'll come back to it later.",
      "Captured! One less thing rattling around your brain.",
    ],
    inbox_nudge: [
      "You've got some thoughts saved up \u2014 want to look through them together?",
    ],
    task_complete: [
      "Nice \u2014 that's done! Feels good, right?",
      "Crossed off! What's next on the adventure?",
    ],
    streak_update: ["You're on a roll! Keep it going."],
    achievement_unlock: [
      "Hey, you just unlocked something! That's worth celebrating.",
    ],
    empty_tasks: [
      "No tasks yet! Tell me what's on your mind and we'll make a plan.",
    ],
    empty_routines: ["No routines yet! Want to build one together? I'll help."],
    empty_inbox: ["All clear! Brain's nice and tidy."],
    sort_offer: [
      "Want me to help sort these? I'll suggest where each one could go.",
    ],
    sort_complete: [
      "All organized! Take a peek and adjust whatever doesn't feel right.",
    ],
    error_generic: ["Oops, something went sideways. Let's try that again."],
  },
  deer: {
    intro: [
      "Hello. I'm Deer.\n\nI notice things \u2014 the small moments, the quiet wins, the efforts that might otherwise go unseen. I'll point them out when you need to be reminded. You don't have to do big things to be doing enough. I see you already.",
    ],
    greeting_morning: [
      "Good morning. I hope you slept well.",
      "Morning. Take it easy as you start the day.",
    ],
    greeting_afternoon: [
      "Afternoon. I noticed you're here \u2014 that's good.",
      "Hey. How's your energy this afternoon?",
    ],
    greeting_evening: [
      "Evening. You did well today, even if it doesn't feel like it.",
      "The day is settling. So can you.",
    ],
    greeting_return_short: [
      "Hey, it's nice to see you again. How have you been?",
      "Welcome back. I noticed you were away \u2014 hope everything's okay.",
    ],
    greeting_return_long: [
      "It's been a while. I thought of you. No pressure \u2014 just happy you're here.",
      "You've been gone a bit, and that's okay. Everything's still here, waiting patiently.",
    ],
    capture_ack: ["I'll hold that for you.", "Gently noted.", "Safe with me."],
    inbox_nudge: [
      "I've noticed some thoughts have been sitting for a bit. Whenever you're ready.",
    ],
    task_complete: [
      "That's done. I see you putting in the effort.",
      "Completed. Every small thing adds up, you know.",
    ],
    streak_update: [
      "I've noticed you've been showing up more. That matters.",
    ],
    achievement_unlock: ["You reached something meaningful. I noticed."],
    empty_tasks: ["Nothing here yet. Share what's on your mind when you're ready."],
    empty_routines: [
      "No routines yet. We can build something gentle whenever you'd like.",
    ],
    empty_inbox: ["Everything's sorted. A quiet moment."],
    sort_offer: [
      "Would you like me to help organize these? I'll be gentle with them.",
    ],
    sort_complete: ["All set. Take a look when you're ready."],
    error_generic: ["Something didn't quite work. It's okay \u2014 let's try again."],
  },
  frog: {
    intro: [
      "RIBBIT! Hi, I'm Frog!\n\nOkay so here's the thing \u2014 I don't take any of this too seriously, and that includes you. Life is hard, brains are weird, and sometimes you just gotta hop around aimlessly. I'm here for the goofy moments and the real ones. Mostly the goofy ones. Let's be friends!",
    ],
    greeting_morning: [
      "Ribbit! Good morning! Let's hop to it... or not. Your call!",
      "Morning! *splash* Sorry, just woke up. What's the plan?",
    ],
    greeting_afternoon: [
      "Afternoon, friend! Lily pad's warm, vibes are good.",
      "Hey! How's the pond treating you today?",
    ],
    greeting_evening: [
      "Evening! Almost time to croak... I mean, relax.",
      "Hey! You survived another day. That deserves a *ribbit* of respect.",
    ],
    greeting_return_short: [
      "You're back! *happy splashing* What'd I miss?",
      "Hey hey! The pond was quiet without you.",
    ],
    greeting_return_long: [
      "Where ya been? Just kidding, I'm not your mom. Glad you're here! Fresh start?",
      "Long time no hop! No worries, I've just been sitting on my lily pad. Ready when you are!",
    ],
    capture_ack: [
      "Yoink! Snagged that thought.",
      "Got it! *tongue snap*",
      "Noted! Filed under 'brain stuff'.",
    ],
    inbox_nudge: [
      "Psst... you've got some thoughts fermenting in here. Wanna poke through them?",
    ],
    task_complete: [
      "DONE! *celebratory ribbit*",
      "Boom! One less thing. High five! ...I have webbed feet but you get the idea.",
    ],
    streak_update: ["Hop hop hop \u2014 you're on a streak! Don't stop now!"],
    achievement_unlock: [
      "Whoa, achievement unlocked! You're basically a frog prince/princess now.",
    ],
    empty_tasks: [
      "Nothing here! Brain dump some stuff and I'll catch it. *opens mouth wide*",
    ],
    empty_routines: [
      "No routines yet! Want to build one? I promise it won't be boring. ...Probably.",
    ],
    empty_inbox: [
      "Inbox: sparkling clean! *chef's kiss* ...Do frogs kiss? Unclear.",
    ],
    sort_offer: [
      "Want me to sort this mess? I'm surprisingly organized for a frog.",
    ],
    sort_complete: [
      "Sorted! I put everything in neat little lily pads. Take a look!",
    ],
    error_generic: ["Whoops! Something croaked. Let's try again."],
  },
};

export function getCompanionCopy(
  companionType: CompanionType,
  context: CopyContext
): string {
  const messages = copy[companionType]?.[context];
  if (!messages || messages.length === 0) {
    return copy.fox[context]?.[0] ?? "";
  }
  return messages[Math.floor(Math.random() * messages.length)];
}
