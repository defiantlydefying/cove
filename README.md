<p align="center">
  <img src="public/branding/cove-logo-with-text.png" alt="Cove" width="280" />
</p>

<p align="center">
  <strong>Your executive function companion.</strong><br/>
  A personal productivity app that helps you manage tasks, build routines, track wellness, and stay on top of your day — without feeling overwhelmed.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white" alt="Capacitor" />
</p>

---

## Overview

Cove is designed around the idea that productivity tools should adapt to you, not the other way around. Every module is opt-in, the interface stays calm and uncluttered, and the focus is always on helping you follow through — not adding more to your plate.

```mermaid
graph LR
    A[Daily View] --> B[Tasks]
    A --> C[Routines]
    A --> D[Wellness]
    A --> E[Reminders]
    B --> F[Gamification]
    C --> F
    D --> F
    C --> G[Community]
    F --> H[Levels & Achievements]
```

## Features

### Tasks

Create, organize, and complete tasks with priority levels, due dates, and categories. Completing tasks earns XP toward your progress level and triggers achievement unlocks.

### Routines

Build step-by-step routines with optional time tracking and durations. Use AI-powered generation to create routines from a simple description, or browse community-shared routines for inspiration.

```mermaid
flowchart LR
    A[Create routine] --> B{How?}
    B --> C[Build manually]
    B --> D[AI generate from prompt]
    B --> E[Import from community]
    C --> F[Add steps & durations]
    D --> F
    E --> F
    F --> G[Track daily]
    G --> H[Earn XP & streaks]
```

### Focus Timer

A Pomodoro-style timer with focus, short break, and long break sessions. Tracks your daily focus count and automatically cycles between work and rest periods.

### Wellness Tracker

Log your mood, energy, and sleep with a simple 1–5 scale. View trends over time with 30-day pattern analysis to spot what's working and what isn't.

### Reminders

Schedule reminders with flexible recurrence (daily, weekly, specific days) and natural language AI parsing. Supports browser notifications and native push notifications on mobile.

### Gamification

Earn XP across every module. Level up from Seedling to Legendary, maintain streaks with 7-day activity dots, and unlock achievements as you build consistency.

```mermaid
graph TD
    A[Complete activity] --> B[Record XP]
    B --> C[Update streak]
    B --> D[Check achievements]
    C --> E[Level progression]
    D --> F{New unlock?}
    F -- Yes --> G[Toast notification]
    F -- No --> H[Continue]
    E --> H
```

### Community

An opt-in, pseudonymous library where users can share routines for others to browse. Filter by tags, mark routines as helpful, and import them into your own Cove with one click. No profiles, no comments, no pressure.

### Planner

A time-grid calendar view paired with priority zone columns — Must Do, Should Do, Could Do. Drag items between zones or onto the timeline to plan your day visually.

---

## Architecture

```mermaid
graph TB
    subgraph Client
        A[Next.js App Router] --> B[React Components]
        B --> C[Tailwind CSS + Framer Motion]
    end

    subgraph API
        A --> D[API Routes]
        D --> E[NextAuth.js]
        D --> F[Prisma ORM]
    end

    subgraph Data
        F --> G[(PostgreSQL)]
    end

    subgraph Native
        A --> H[Capacitor]
        H --> I[iOS]
        H --> J[Android]
    end
```

## Design

Cove uses a calm, nature-inspired design language with soft earth tones, rounded corners, and gentle animations. Multiple themes are available, and the interface is fully responsive across desktop, tablet, and mobile.

| Principle | Description |
|---|---|
| **Opt-in modules** | Every feature can be enabled or disabled independently |
| **Calm interface** | Muted palette, no red badges, no notification anxiety |
| **Gentle gamification** | Streaks pause instead of resetting — no punishment for missing a day |
| **Privacy first** | Community participation is pseudonymous and completely optional |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Native | Capacitor (iOS / Android) |
