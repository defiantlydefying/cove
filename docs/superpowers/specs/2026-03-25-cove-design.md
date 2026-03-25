# Cove -- Design Specification

A modular executive function companion for neurodivergent users. Web-first, expanding to mobile later.

## Core Concept

Cove is a daily planner and self-management tool built around toggleable modules. Every brain is different, so every Cove is different. Users start with a minimal daily view and add modules as they need them. The app is calm by default, customizable in every direction, and never punishes you for a bad day.

**Name:** Cove -- a sheltered, safe, personal space. The metaphor extends across the product: modules can be thought of as parts of your cove, the AI companion as a guide, the community as fellow travelers.

**Tagline:** "Your cove."

## Target Users

Primary: teens through working adults (13-40) across the neurodivergent spectrum -- ADHD, autism, dyslexia, dyscalculia, anxiety, and more. Accessible to all ages. The app does not require a diagnosis; anyone who struggles with executive function is welcome.

## Architecture: The Module System

The app is built around independent, toggleable modules. Each module:

- Can be enabled or disabled at any time
- Has its own settings
- Communicates with other modules through a shared data layer (e.g., the AI companion can read wellness data to make smarter suggestions)
- Can be rearranged on the daily view

### Modules

**Daily View** (always on)
The home screen. Shows today's tasks, active routines, and check-ins from enabled modules. Customizable layout and density. Modules appear as tab-like elements that users can toggle between -- similar to folder tabs. This is the hub that ties everything together.

**Task Manager** (persistent sidebar)
Deadlines, priorities, subtask breakdown, recurring tasks. Supports multiple views (list, board, timeline). Tasks can be tagged by energy level required (e.g., "low energy," "high focus"). The task manager appears as a persistent side panel that is always visible by default, even when not actively being used. Users can dismiss it with an X button and reopen it at any time.

**Routine Builder**
Create daily routines (morning, wind-down, work, exercise, etc.). Supports step-by-step guided mode or simple checklist mode. Flexible timing -- routines are not rigid schedules. Users can skip steps without penalty.

**Wellness Tracker**
Quick check-ins for mood, energy, and sleep quality. Simple scales (1-5 or word-based like "running on fumes" to "fully charged"). Optional check-in prompts at user-configured times. Pattern detection over time (e.g., "you tend to crash on Wednesdays," "your energy is usually higher after your morning routine"). This data feeds into the AI companion's suggestions.

**Reminders and Nudges**
Customizable reminders for tasks, self-care, hydration, breaks, medication, and anything else. Gentle tone by default. Snooze-friendly -- snoozing is not a failure. Users control frequency, timing, and wording.

**AI Companion** (toggleable)
A chat-based assistant that learns the user's patterns over time. Capabilities:
- Break down overwhelming tasks into smaller steps
- Suggest strategies based on the user's history and wellness data
- Offer comfort and support during difficult moments
- Adapt suggestions based on current energy level
- Learn what works for each individual user

The companion is optional and can be toggled on/off at any time. It is not constantly present -- it lives in a chat interface the user opens when they want it. It should feel like a supportive friend, not a productivity coach.

**Community Strategies** (toggleable, opt-in)
Anonymous strategy and tip sharing. Users can:
- Browse strategies from other users
- Upvote helpful tips
- Filter by challenge area (e.g., "task paralysis," "time blindness," "morning routines")
- Contribute their own strategies anonymously

No profiles, no followers, no social feeds. The community is purely functional -- a shared knowledge base.

**Gamification** (toggleable)
Progress tracking, achievements, and XP for completing tasks and routines. Fully optional. Key design decision: no shame mechanics. Missing a day pauses a streak rather than breaking it. The gamification system rewards consistency without punishing gaps.

## Onboarding Experience

First-time users are greeted with a welcome module that serves as both introduction and setup. The onboarding:

- Introduces the concept of Cove as a personal, modular space
- Walks users through available modules in a tab-like browsing interface
- Lets users toggle modules on/off as they explore
- Explains what each module does in plain, friendly language
- Ends with a personalized daily view based on their choices
- Can be revisited at any time from settings

The goal is zero overwhelm. Users should feel guided, not interrogated. Sensible defaults are pre-selected so users can skip through quickly if they prefer.

## Customization System

Users control every aspect of their experience:

- **Themes** -- color schemes, light/dark mode, custom accent colors
- **Density** -- compact, comfortable, or spacious layouts
- **Animations** -- full on/off toggle for all motion and transitions
- **Sounds** -- notification sounds on/off, volume, tone selection
- **Module layout** -- drag and arrange modules on the daily view
- **Language and tone** -- the app's voice can be adjusted (casual, neutral, encouraging)
- **Font size** -- adjustable for readability

Customization is a core principle, not an afterthought. Sensory sensitivities, visual preferences, and motivation styles vary widely across neurodivergent users. The app adapts to them, not the other way around.

## Design Principles

1. **No punishment** -- missed tasks roll forward, streaks pause instead of breaking, no guilt language, no red warning colors for overdue items
2. **Low floor, high ceiling** -- simple to start, powerful when you want it
3. **Sensory-aware** -- every visual and audio element is controllable
4. **Privacy-first** -- user data stays with the user, community features are anonymous and opt-in
5. **Gentle defaults** -- new users get a calm, minimal setup with prompts to explore more
6. **Autonomy** -- every feature is toggleable; the user is always in control

## Tech Stack

- **Frontend:** React with Next.js -- fast, SEO-friendly, good path to mobile via React Native later
- **Backend:** Node.js API
- **Database:** PostgreSQL -- structured relational data, good fit for modules and user settings
- **AI Companion:** Claude API for the conversational assistant
- **Authentication:** Email/password + OAuth (Google, Apple)
- **Hosting:** Vercel (frontend) + Railway or Render (backend)

## Monetization

Launch free. Monetization strategy to be determined after the app gains traction and user feedback reveals what features people value most. This builds trust with a community often burned by paywalled accessibility features.

## Future Considerations

- Mobile app via React Native (planned expansion after web launch)
- Offline support
- Data export (users own their data)
- Accessibility audit (screen readers, keyboard navigation, high contrast)
- Localization/internationalization
