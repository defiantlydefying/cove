# Community Routine Library — Design Spec

## Overview

A shared library where users can publish routines for others to browse, filter by tags, and copy into their own Cove. Completely optional (disabled by default), pseudonymous, no comments/messaging/following. Safety through reporting and auto-hide.

## Decisions Made

- **Core unit**: Shared routines (tips board comes later as phase 2)
- **Identity**: Pseudonymous display names, no real names, no profiles
- **Self-disclosure**: Encouraged but optional — author note field for context
- **Discovery**: Tag-based filtering now, text search later
- **Import**: One-click copy, no attribution link, fully independent copy
- **Default state**: Module disabled, user opts in explicitly

## Data Model

### CommunityRoutine
```
id              String   @id @default(cuid())
authorId        String
displayName     String
authorNote      String?
name            String
description     String?
startTime       String?
showTimes       Boolean  @default(false)
showDurations   Boolean  @default(true)
tags            String[]
helpfulCount    Int      @default(0)
hidden          Boolean  @default(false)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

user  User @relation(fields: [authorId], references: [id], onDelete: Cascade)
steps CommunityRoutineStep[]
helpfuls CommunityHelpful[]
reports  CommunityReport[]
```

### CommunityRoutineStep
```
id                  String @id @default(cuid())
communityRoutineId  String
title               String
durationMinutes     Int?
sortOrder           Int    @default(0)

communityRoutine CommunityRoutine @relation(...)
```

### CommunityHelpful
```
id                  String @id @default(cuid())
userId              String
communityRoutineId  String
createdAt           DateTime @default(now())

user             User @relation(...)
communityRoutine CommunityRoutine @relation(...)

@@unique([userId, communityRoutineId])
```

### CommunityReport
```
id                  String @id @default(cuid())
userId              String
communityRoutineId  String
reason              String
createdAt           DateTime @default(now())

user             User @relation(...)
communityRoutine CommunityRoutine @relation(...)
```

### User addition
```
displayName String?
```

## Tags

Fixed sets (not freeform):

**Condition**: ADHD, Autism, Anxiety, Depression, OCD, PTSD, Bipolar, Dyslexia, General

**Type**: Morning, Evening, Work, Self-Care, Exercise, Hygiene, Social, Wind-Down, Focus

**Complexity**: Auto-calculated from step durations — Quick (<15m), Moderate (15-45m), Detailed (>45m)

## Publishing Flow

1. "Share to community" button on existing RoutineCard
2. Publish form: name, description, author note (encouraged but optional), display name (set once), condition + type tag pickers
3. Creates independent snapshot as CommunityRoutine + CommunityRoutineSteps
4. Content guidelines shown at publish time

## Browsing UI

Community tab in dashboard:
- Filter bar with tag chips (condition, type). Multi-select within category = OR, across = AND.
- Cards: name, description, display name, author note, tags, step count, duration, helpful count
- Actions: "Add to my routines" (copy), "Helpful" (toggle), "Report"
- Sorted by helpful count (most helpful first), with recent as secondary sort

## Import

One-click "Add to my routines":
- Creates a new Routine + RoutineSteps in user's account
- Copies name, steps, durations, startTime, showTimes, showDurations
- No connection to original — fully independent

## Display Name

- Prompted on first community interaction (publish or helpful vote)
- Auto-suggest gentle random name (e.g. "calm_river_42")
- Stored on User model, changeable in Settings
- Unique, 3-30 chars, alphanumeric + underscores

## Safety

- Report button on every card (reasons: Inappropriate, Harmful advice, Spam, Other + text)
- Auto-hide at 3+ reports (hidden=true)
- No comments, messaging, following, or profiles
- Author can unpublish anytime
- Content guidelines at publish: "Share what genuinely helps you. No medical advice, no product promotion."

## API Endpoints

- GET /api/community/routines — list, filter by tags, paginated
- POST /api/community/routines — publish
- DELETE /api/community/routines/[id] — unpublish (author only)
- POST /api/community/routines/[id]/helpful — toggle
- POST /api/community/routines/[id]/report — report
- POST /api/community/routines/[id]/import — copy to user's routines
- PATCH /api/user/display-name — set/update

## Module Integration

- Add "community" to module system (onboarding, settings, dashboard)
- Default disabled — opt-in only
- Tab label: "Community"
