# Community Vents & Enhanced Sharing

## Overview

Expand the Community tab from routine-sharing-only into a fuller community space with:
1. A prominent "Share to Community" button on the Routines tab
2. A vents/rants section where users can post ephemeral thoughts, receive comments, and connect via DMs
3. A lightweight messaging system (BandLab/Pinterest-style)
4. Random avatar + display name identity system tied to gamification unlocks

---

## 1. Routines Tab — Share Button Enhancement

### Per-card share (existing)
The `RoutineCard` already has an `onShare` prop. Make the icon more visually prominent — currently easy to miss.

### Top-level share button (new)
Add a "Share to Community" button next to the existing "+ New routine" button in the Routines tab header. Clicking it opens a routine picker (list of user's routines), selecting one flows into the existing `PublishRoutineForm`.

---

## 2. Community Tab — New Structure

The Community tab gets a sub-navigation toggle at the top:

- **Routines** — existing `CommunityBrowser` (shared routines with tags/filters)
- **Vents** — new ephemeral posts section

Plus a **Messages icon** (with unread badge) in the Community header that opens the messaging inbox.

---

## 3. Identity System

### Display names
- Auto-generated on first community interaction using the existing `generateRandomName()` pattern (adjective_noun_number)
- Stored in `User.displayName` (field already exists)
- User can regenerate their name at any time from community settings

### Avatars
- Randomly assigned from a base set (~20-30 starter icons) on first community interaction
- Icons are simple, friendly illustrations (animals, plants, objects — Khan Academy style)
- Stored as a key/ID on the user model (e.g., `"fox"`, `"cactus"`, `"mushroom"`)
- User can regenerate (re-roll from their unlocked set)

### Avatar unlocks via gamification
- Base set: ~20-30 avatars available to everyone
- Unlockable set: ~50-70 additional avatars earned through XP thresholds or specific achievements
- Ties into existing `UserAchievement` and `UserStreak` (totalXp) systems
- Examples: "Reach level 5" unlocks celestial pack, "7-day streak" unlocks rare animals, etc.

### Profile card
Clicking any display name/avatar in community opens a mini profile card:
- Avatar + display name
- "Request to chat" button
- Nothing else (no bio, no post history, no stats)

---

## 4. Vents System

### Creating a vent
1. "New vent" button in the Vents sub-tab
2. Text area (max 2000 characters)
3. Lifespan picker: 24 hours / 48 hours / 5 days / 7 days
4. Privacy/contact preference: "Allow chat requests" / "Anonymous replies only" / "Both"
5. Post button — publishes under user's persistent display name + avatar

### Vent display
- Cards showing: avatar, display name, vent text, time remaining (e.g., "5h left"), comment count
- Tapping expands to show comments
- Action buttons based on poster's privacy setting:
  - "Reply privately" (anonymous reply visible only to poster + replier)
  - "Request to chat" (initiates DM request)
- Report button on each vent
- Gentle guidelines banner at top of Vents section: *"A space to let things out. Be kind — everyone here is figuring it out."*

### Vent expiry
- Each vent has an `expiresAt` timestamp calculated from creation time + chosen lifespan
- Expired vents are filtered out on read (not shown in feed)
- Background cleanup: a periodic job or API-triggered sweep deletes expired vents and their associated comments/replies
- All comments, private replies, and DM requests related to a vent cascade-delete with it

### Comments
- Public comments visible to everyone
- Show commenter's avatar + display name
- Clicking commenter's name opens their profile card (with "Request to chat")
- Max 500 characters per comment

### Private replies
- Only visible to the poster and the person who replied
- Creates a mini-thread (back and forth) that lives on the vent
- Disappears when the vent expires

---

## 5. Messaging System

### Request flow
1. User taps "Request to chat" (from profile card, vent, comment, or shared routine)
2. Recipient sees in their Messages inbox under "Requests": "[avatar] [display_name] wants to chat"
3. No context about where the request originated
4. Recipient can **Accept** or **Decline**
5. Accept: opens a conversation thread, both can message freely
6. Decline: request disappears silently (requester is not notified of rejection)

### Messages inbox
Accessible from a messages icon (with unread badge) in the Community tab header. Two sections:

- **Requests** — pending incoming chat requests (accept/decline)
- **Conversations** — active threads sorted by most recent message

### Conversation threads
- Simple message bubbles (Pinterest/BandLab style)
- Display name + avatar at top of thread
- No typing indicators, no read receipts, no online status
- Messages persist indefinitely (not tied to vent expiry)
- Either party can delete/leave the conversation

### Technical approach
- Polling-based (fetch on page load + manual refresh or periodic poll)
- No WebSockets/SSE — this isn't a real-time chat app
- Simple DB rows for messages

---

## 6. Light Moderation

- Gentle tone-setting banner at the top of the Vents section
- Report button on vents and comments
- Auto-hide after N reports (threshold TBD, likely 3-5)
- No heavy moderation system, no moderator roles
- Vent expiry naturally limits harm (content disappears)

---

## 7. Data Model (new tables)

### CommunityAvatar (reference table)
- `id` — cuid
- `key` — unique string (e.g., "fox", "cactus")
- `category` — string (e.g., "starter", "celestial", "rare-animals")
- `unlockType` — "default" | "xp" | "achievement"
- `unlockThreshold` — nullable int (XP needed) or achievement key

### User model additions
- `avatarKey` — string, references CommunityAvatar.key (default: randomly assigned starter)

### Vent
- `id` — cuid
- `authorId` — references User
- `body` — string (max 2000)
- `lifespan` — enum: "24h" | "48h" | "5d" | "7d"
- `expiresAt` — DateTime
- `contactPreference` — enum: "dms" | "anonymous_replies" | "both"
- `reportCount` — int, default 0
- `hidden` — boolean, default false
- `createdAt` — DateTime

### VentComment
- `id` — cuid
- `ventId` — references Vent (cascade delete)
- `authorId` — references User
- `body` — string (max 500)
- `createdAt` — DateTime

### VentPrivateReply
- `id` — cuid
- `ventId` — references Vent (cascade delete)
- `authorId` — references User
- `recipientId` — references User
- `body` — string (max 500)
- `createdAt` — DateTime

### ChatRequest
- `id` — cuid
- `requesterId` — references User
- `recipientId` — references User
- `status` — enum: "pending" | "accepted" | "declined"
- `createdAt` — DateTime
- Unique constraint: [requesterId, recipientId]

### Conversation
- `id` — cuid
- `createdAt` — DateTime

### ConversationParticipant
- `id` — cuid
- `conversationId` — references Conversation
- `userId` — references User
- Unique constraint: [conversationId, userId]

### DirectMessage
- `id` — cuid
- `conversationId` — references Conversation (cascade delete)
- `senderId` — references User
- `body` — string (max 2000)
- `createdAt` — DateTime

### VentReport
- `id` — cuid
- `ventId` — references Vent
- `userId` — references User
- `reason` — string
- `createdAt` — DateTime
- Unique constraint: [userId, ventId]

---

## 8. API Routes

### Vents
- `GET /api/community/vents` — list non-expired, non-hidden vents (paginated)
- `POST /api/community/vents` — create a vent
- `DELETE /api/community/vents/[id]` — delete own vent
- `POST /api/community/vents/[id]/report` — report a vent

### Vent comments
- `GET /api/community/vents/[id]/comments` — list comments on a vent
- `POST /api/community/vents/[id]/comments` — add a comment

### Vent private replies
- `GET /api/community/vents/[id]/private-replies` — get private reply thread (only if participant)
- `POST /api/community/vents/[id]/private-replies` — send a private reply

### Messaging
- `GET /api/community/messages` — list conversations + unread count
- `GET /api/community/messages/[conversationId]` — get messages in a thread
- `POST /api/community/messages/[conversationId]` — send a message
- `DELETE /api/community/messages/[conversationId]` — leave/delete conversation

### Chat requests
- `GET /api/community/chat-requests` — list pending incoming requests
- `POST /api/community/chat-requests` — send a chat request
- `PATCH /api/community/chat-requests/[id]` — accept or decline

### Identity
- `GET /api/user/display-name` — get current display name (already exists)
- `POST /api/user/display-name/regenerate` — generate a new random name
- `GET /api/user/avatar` — get current avatar + unlocked set
- `POST /api/user/avatar` — change avatar (from unlocked set)
- `POST /api/user/avatar/regenerate` — random re-roll from unlocked set

### Avatar unlocks
- `GET /api/community/avatars` — list all avatars with unlock status

---

## 9. Component Structure

```
src/components/community/
  CommunityBrowser.tsx          (existing — routines browser)
  CommunityRoutineCard.tsx      (existing)
  PublishRoutineForm.tsx         (existing)
  CommunityTabs.tsx             (new — Routines | Vents toggle + messages icon)
  VentFeed.tsx                  (new — list of vents)
  VentCard.tsx                  (new — single vent display)
  VentComposer.tsx              (new — create a vent form)
  VentComments.tsx              (new — comments list + input)
  VentPrivateThread.tsx         (new — private reply thread)
  ProfileCard.tsx               (new — mini profile popup)
  MessagesInbox.tsx             (new — conversations + requests list)
  ConversationThread.tsx        (new — message bubbles)
  ChatRequestCard.tsx           (new — accept/decline UI)
  AvatarPicker.tsx              (new — choose from unlocked avatars)
  RoutineSharePicker.tsx        (new — pick a routine to share)
```

---

## 10. Gamification Integration

Avatar unlocks hook into the existing XP/achievement system:

- On XP gain or achievement unlock, check if new avatars are now available
- Show a toast/notification: "New avatar unlocked!"
- Unlocked avatars appear in the avatar picker with a "NEW" badge

Unlock tiers (example, tunable):
- Starter set: available to all (account creation)
- 100 XP: nature pack (5 avatars)
- 500 XP: space pack (5 avatars)
- 7-day streak achievement: rare animals pack (5 avatars)
- 30-day streak: legendary pack (5 avatars)
- Specific achievements unlock individual avatars

---

## 11. Scope & Phasing

**Phase 1 (MVP):**
- Community sub-tabs (Routines / Vents)
- Vent creation, display, expiry, comments
- Top-level "Share to Community" button on Routines tab
- Display name regeneration (already partially built)
- Avatar assignment from starter set
- Report button + auto-hide

**Phase 2:**
- Private replies on vents
- Chat requests + messaging inbox
- Conversation threads
- Profile cards

**Phase 3:**
- Avatar unlocks tied to gamification
- Avatar picker UI
- Unlock notifications
