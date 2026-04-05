# Capacitor iOS App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap Cove in a native iOS shell using Capacitor with local notifications, haptics, and a service worker for instant loads.

**Architecture:** Capacitor remote-URL mode loads the deployed Next.js app in a native WebView. A thin platform detection layer in `src/lib/capacitor/` bridges native APIs with web fallbacks. A service worker caches static assets for fast startup.

**Tech Stack:** Capacitor 7, @capacitor/local-notifications, @capacitor/haptics, @capacitor/status-bar, @capacitor/splash-screen, Workbox (service worker)

---

## File Map

### New files
- `capacitor.config.ts` — Capacitor app config (appId, server URL, plugin settings)
- `src/lib/capacitor/index.ts` — Platform detection: `isNative()`, `isIOS()`, `initCapacitor()`
- `src/lib/capacitor/notifications.ts` — Schedule/cancel local notifications with web fallback
- `src/lib/capacitor/haptics.ts` — Haptic feedback with no-op web fallback
- `src/lib/capacitor/status-bar.ts` — iOS status bar style sync
- `public/manifest.json` — Web app manifest for PWA metadata
- `public/sw.js` — Service worker for shell asset caching
- `src/components/OfflineBanner.tsx` — "You're offline" banner

### Modified files
- `package.json` — Add Capacitor dependencies and scripts
- `src/app/layout.tsx` — Add manifest link, theme-color meta, viewport meta for iOS
- `src/app/globals.css` — Add safe area insets for Capacitor iOS
- `src/components/providers/ThemeProvider.tsx` — Sync status bar style on theme change
- `src/components/reminders/ReminderScheduler.tsx` — Use native notifications when in Capacitor
- `src/components/app-shell/AppShell.tsx` — Add OfflineBanner, init Capacitor on mount
- `src/components/tasks/TaskItem.tsx` — Add haptic on task completion
- `src/components/routines/RoutineList.tsx` — Add haptic on step completion
- `src/components/productivity/FocusTimer.tsx` — Add haptic on session start/complete
- `src/components/gamification/StreakCard.tsx` — Add haptic on milestone

---

## Task 1: Install Capacitor and configure

**Files:**
- Modify: `package.json`
- Create: `capacitor.config.ts`

- [ ] **Step 1: Install Capacitor core and CLI**

Run:
```bash
cd /Users/EmmaBB/cove
npm install @capacitor/core @capacitor/cli
```

- [ ] **Step 2: Install Capacitor plugins**

Run:
```bash
npm install @capacitor/local-notifications @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen @capacitor/ios
```

- [ ] **Step 3: Create capacitor.config.ts**

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.cove.companion",
  appName: "Cove",
  server: {
    url: "http://localhost:3000",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FAF8F5",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_cove",
      iconColor: "#6B8F71",
    },
  },
};

export default config;
```

- [ ] **Step 4: Add Capacitor scripts to package.json**

Add to `"scripts"`:
```json
"cap:init": "npx cap sync ios",
"cap:open": "npx cap open ios",
"cap:sync": "npx cap sync ios"
```

- [ ] **Step 5: Initialize iOS project**

Run:
```bash
npx cap add ios
```

This generates the `ios/` directory with the Xcode project.

- [ ] **Step 6: Add ios/ to .gitignore**

Append to `.gitignore`:
```
# Capacitor iOS build
ios/
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json capacitor.config.ts .gitignore
git commit -m "Add Capacitor iOS setup with plugins"
```

---

## Task 2: Platform detection layer

**Files:**
- Create: `src/lib/capacitor/index.ts`
- Test: `src/lib/capacitor/index.test.ts`

- [ ] **Step 1: Write the test**

```ts
// src/lib/capacitor/index.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("capacitor platform detection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("isNative returns false when Capacitor is not present", async () => {
    const mod = await import("./index");
    expect(mod.isNative()).toBe(false);
  });

  it("isIOS returns false when not on iOS", async () => {
    const mod = await import("./index");
    expect(mod.isIOS()).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/capacitor/index.test.ts`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/capacitor/index.ts
import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/capacitor/index.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacitor/index.ts src/lib/capacitor/index.test.ts
git commit -m "Add Capacitor platform detection utilities"
```

---

## Task 3: Haptics module

**Files:**
- Create: `src/lib/capacitor/haptics.ts`
- Test: `src/lib/capacitor/haptics.test.ts`

- [ ] **Step 1: Write the test**

```ts
// src/lib/capacitor/haptics.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: { Light: "LIGHT", Medium: "MEDIUM" },
  NotificationType: { Success: "SUCCESS" },
}));

describe("haptics", () => {
  it("tapLight is a no-op on web", async () => {
    const { tapLight } = await import("./haptics");
    // Should not throw
    await tapLight();
  });

  it("tapMedium is a no-op on web", async () => {
    const { tapMedium } = await import("./haptics");
    await tapMedium();
  });

  it("success is a no-op on web", async () => {
    const { success } = await import("./haptics");
    await success();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/capacitor/haptics.test.ts`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/capacitor/haptics.ts
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export async function tapLight(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Haptics.impact({ style: ImpactStyle.Light });
}

export async function tapMedium(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Haptics.impact({ style: ImpactStyle.Medium });
}

export async function success(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Haptics.notification({ type: NotificationType.Success });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/capacitor/haptics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacitor/haptics.ts src/lib/capacitor/haptics.test.ts
git commit -m "Add haptics module with web fallback"
```

---

## Task 4: Local notifications module

**Files:**
- Create: `src/lib/capacitor/notifications.ts`
- Test: `src/lib/capacitor/notifications.test.ts`

- [ ] **Step 1: Write the test**

```ts
// src/lib/capacitor/notifications.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSchedule = vi.fn().mockResolvedValue({});
const mockCancel = vi.fn().mockResolvedValue({});
const mockRequestPermissions = vi.fn().mockResolvedValue({ display: "granted" });

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: mockSchedule,
    cancel: mockCancel,
    requestPermissions: mockRequestPermissions,
  },
}));

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scheduleReminder falls back to web Notification API on non-native", async () => {
    const { scheduleReminder } = await import("./notifications");
    // Should not call native schedule on web
    await scheduleReminder({ id: "test-1", title: "Drink water", body: "Stay hydrated" });
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("cancelReminder is a no-op on web", async () => {
    const { cancelReminder } = await import("./notifications");
    await cancelReminder("test-1");
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/capacitor/notifications.test.ts`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/capacitor/notifications.ts
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface ReminderNotification {
  id: string;
  title: string;
  body?: string;
  scheduleAt?: Date;
  every?: "minute" | "hour" | "day";
}

function stringIdToNumber(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export async function requestPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  }
  if (typeof Notification !== "undefined") {
    const result = await Notification.requestPermission();
    return result === "granted";
  }
  return false;
}

export async function scheduleReminder(notification: ReminderNotification): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const notifId = stringIdToNumber(notification.id);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId,
        title: notification.title,
        body: notification.body ?? "",
        ...(notification.scheduleAt
          ? { schedule: { at: notification.scheduleAt, every: notification.every } }
          : {}),
      },
    ],
  });
}

export async function cancelReminder(id: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [{ id: stringIdToNumber(id) }],
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/capacitor/notifications.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacitor/notifications.ts src/lib/capacitor/notifications.test.ts
git commit -m "Add local notifications module with web fallback"
```

---

## Task 5: Status bar module

**Files:**
- Create: `src/lib/capacitor/status-bar.ts`
- Test: `src/lib/capacitor/status-bar.test.ts`

- [ ] **Step 1: Write the test**

```ts
// src/lib/capacitor/status-bar.test.ts
import { describe, it, vi } from "vitest";

const mockSetStyle = vi.fn().mockResolvedValue({});

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/status-bar", () => ({
  StatusBar: { setStyle: mockSetStyle },
  Style: { Dark: "DARK", Light: "LIGHT" },
}));

describe("status-bar", () => {
  it("syncStatusBar is a no-op on web", async () => {
    const { syncStatusBar } = await import("./status-bar");
    await syncStatusBar("dark");
    // Should not call native API on web
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/capacitor/status-bar.test.ts`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/capacitor/status-bar.ts
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function syncStatusBar(theme: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await StatusBar.setStyle({
    style: theme === "dark" ? Style.Dark : Style.Light,
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/capacitor/status-bar.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacitor/status-bar.ts src/lib/capacitor/status-bar.test.ts
git commit -m "Add status bar module with web fallback"
```

---

## Task 6: Web app manifest and service worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Cove",
  "short_name": "Cove",
  "description": "Your executive function companion",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#FAF8F5",
  "theme_color": "#4A5D4E",
  "icons": [
    {
      "src": "/branding/favicon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/branding/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/branding/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Create service worker**

```js
// public/sw.js
const CACHE_NAME = "cove-shell-v1";
const SHELL_ASSETS = [
  "/dashboard",
  "/branding/android-chrome-192x192.png",
  "/branding/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and API requests
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
```

- [ ] **Step 3: Add manifest link and meta tags to layout.tsx**

In `src/app/layout.tsx`, update the metadata and add head elements.

Replace the existing `metadata` export:
```ts
export const metadata: Metadata = {
  title: "Cove",
  description: "Your executive function companion",
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};
```

Add `viewport` export after metadata:
```ts
export const viewport = {
  themeColor: "#4A5D4E",
  viewportFit: "cover" as const,
};
```

- [ ] **Step 4: Register service worker from layout**

Add a `ServiceWorkerRegistrar` client component. Create `src/components/ServiceWorkerRegistrar.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
```

Then in `layout.tsx`, import and render it inside `<body>` alongside the providers:
```tsx
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// Inside the body:
<body className="h-full flex flex-col">
  <ServiceWorkerRegistrar />
  <SessionProvider>
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  </SessionProvider>
</body>
```

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js src/app/layout.tsx src/components/ServiceWorkerRegistrar.tsx
git commit -m "Add web manifest, service worker, and iOS meta tags"
```

---

## Task 7: Safe area CSS and Capacitor body class

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/CapacitorInit.tsx`

- [ ] **Step 1: Create CapacitorInit component**

This component adds the `capacitor-ios` class to the body when running in Capacitor, and hides the splash screen once loaded.

```tsx
// src/components/CapacitorInit.tsx
"use client";

import { useEffect } from "react";
import { isNative, isIOS } from "@/lib/capacitor";

export default function CapacitorInit() {
  useEffect(() => {
    if (isIOS()) {
      document.body.classList.add("capacitor-ios");
    }
    if (isNative()) {
      document.body.classList.add("capacitor-native");
      import("@capacitor/splash-screen").then(({ SplashScreen }) => {
        SplashScreen.hide();
      });
    }
  }, []);
  return null;
}
```

- [ ] **Step 2: Add safe area CSS to globals.css**

Append to `src/app/globals.css` before the `@media (prefers-reduced-motion)` block:

```css
/* Capacitor iOS safe areas */
.capacitor-ios {
  padding-top: env(safe-area-inset-top);
}

.capacitor-ios .tab-bar-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 3: Add CapacitorInit to layout.tsx**

In `src/app/layout.tsx`, import and render alongside ServiceWorkerRegistrar:

```tsx
import CapacitorInit from "@/components/CapacitorInit";

// Inside the body:
<body className="h-full flex flex-col">
  <CapacitorInit />
  <ServiceWorkerRegistrar />
  ...
</body>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CapacitorInit.tsx src/app/globals.css src/app/layout.tsx
git commit -m "Add iOS safe area CSS and Capacitor init component"
```

---

## Task 8: Offline banner

**Files:**
- Create: `src/components/OfflineBanner.tsx`
- Modify: `src/components/app-shell/AppShell.tsx`

- [ ] **Step 1: Create OfflineBanner component**

```tsx
// src/components/OfflineBanner.tsx
"use client";

import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function handleOnline() { setOffline(false); }
    function handleOffline() { setOffline(true); }

    setOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="bg-cove-amber/15 text-cove-charcoal text-sm text-center py-2 px-4 border-b border-cove-amber/30"
    >
      You're offline - some features unavailable
    </div>
  );
}
```

- [ ] **Step 2: Add OfflineBanner to AppShell**

In `src/components/app-shell/AppShell.tsx`, import and render above the header:

```tsx
import OfflineBanner from "@/components/OfflineBanner";

// Inside the return, at the top of the flex container:
<div className="flex flex-col h-screen">
  <OfflineBanner />
  <a href="#main-content" ...>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/OfflineBanner.tsx src/components/app-shell/AppShell.tsx
git commit -m "Add offline banner to app shell"
```

---

## Task 9: Integrate status bar with ThemeProvider

**Files:**
- Modify: `src/components/providers/ThemeProvider.tsx`

- [ ] **Step 1: Import and call syncStatusBar**

In `ThemeProvider.tsx`, add the status bar sync to both the initial load and the setTheme function:

Add import at top:
```ts
import { syncStatusBar } from "@/lib/capacitor/status-bar";
```

In the `useEffect` that fetches settings, after setting the theme:
```ts
.then((data) => {
  if (data.theme) {
    setThemeState(data.theme);
    document.documentElement.setAttribute("data-theme", data.theme);
    syncStatusBar(data.theme);
  }
})
```

In the `setTheme` function, after setting the attribute:
```ts
const setTheme = (newTheme: string) => {
  setThemeState(newTheme);
  document.documentElement.setAttribute("data-theme", newTheme);
  syncStatusBar(newTheme);
  ...
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/providers/ThemeProvider.tsx
git commit -m "Sync iOS status bar style with theme changes"
```

---

## Task 10: Integrate haptics into completion actions

**Files:**
- Modify: `src/components/tasks/TaskItem.tsx`
- Modify: `src/components/routines/RoutineList.tsx`
- Modify: `src/components/productivity/FocusTimer.tsx`
- Modify: `src/components/gamification/StreakCard.tsx`

- [ ] **Step 1: Read TaskItem.tsx to find the completion handler**

Read the file to find where task completion is toggled.

- [ ] **Step 2: Add haptic to TaskItem completion**

Import at top of `TaskItem.tsx`:
```ts
import { tapLight } from "@/lib/capacitor/haptics";
```

In the completion toggle handler, add `tapLight()` when marking as complete (not when unchecking).

- [ ] **Step 3: Add haptic to RoutineList step completion**

Import at top of `RoutineList.tsx`:
```ts
import { tapLight } from "@/lib/capacitor/haptics";
```

In the step toggle handler (around line 157 in `setCompletedSteps`), call `tapLight()` when adding a step to completed (not when removing).

- [ ] **Step 4: Add haptic to FocusTimer session complete**

Import at top of `FocusTimer.tsx`:
```ts
import { success } from "@/lib/capacitor/haptics";
```

In `handleSessionComplete` (line 61), call `success()` at the start of the function.

- [ ] **Step 5: Read StreakCard.tsx and add haptic**

Read the file. If it renders a milestone/achievement state, import `success` from haptics and call it when a new milestone is displayed.

- [ ] **Step 6: Commit**

```bash
git add src/components/tasks/TaskItem.tsx src/components/routines/RoutineList.tsx src/components/productivity/FocusTimer.tsx src/components/gamification/StreakCard.tsx
git commit -m "Add haptic feedback to task, routine, focus, and streak actions"
```

---

## Task 11: Integrate native notifications into ReminderScheduler

**Files:**
- Modify: `src/components/reminders/ReminderScheduler.tsx`

- [ ] **Step 1: Import notification utilities**

Add to top of `ReminderScheduler.tsx`:
```ts
import { isNative } from "@/lib/capacitor";
import { requestPermission, scheduleReminder, cancelReminder } from "@/lib/capacitor/notifications";
```

- [ ] **Step 2: Request notification permission on mount**

Inside the main `useEffect`, after the initial `fetchReminders()` call, add:
```ts
requestPermission();
```

- [ ] **Step 3: Add native notification to fireReminder**

In the `fireReminder` function, before the existing web Notification logic, add the native path:

```ts
function fireReminder(reminder: ScheduledReminder) {
  const msg = reminder.title + (reminder.message ? ` \u2014 ${reminder.message}` : "");

  toastRef.current(msg, "reminder", 30000, [
    { label: "Snooze", onClick: () => snoozeReminder(reminder.id) },
    { label: "Turn off", onClick: () => disableReminder(reminder.id) },
  ]);

  if (reminder.soundEnabled !== false) {
    playChime();
  }

  // Use native notification on Capacitor, web Notification API on browser
  if (isNative()) {
    scheduleReminder({
      id: reminder.id,
      title: reminder.title,
      body: reminder.message ?? undefined,
    });
  } else if (
    reminder.notifyEnabled !== false &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(reminder.title, {
        body: reminder.message ?? undefined,
        tag: reminder.id,
      });
    } catch {
      // Notifications not supported
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/reminders/ReminderScheduler.tsx
git commit -m "Use native local notifications for reminders in Capacitor"
```

---

## Task 12: Run full test suite and verify

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All existing tests pass, new tests pass.

- [ ] **Step 2: Fix any test failures**

If any tests fail due to the new imports (Capacitor modules not available in jsdom), add the necessary mocks to the test setup or individual test files.

- [ ] **Step 3: Run linter**

Run: `npx eslint .`
Expected: No new errors.

- [ ] **Step 4: Verify dev server starts**

Run: `npm run dev`
Expected: App starts on localhost:3000 without errors. Manifest loads at `/manifest.json`. Service worker registers.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "Fix test and lint issues from Capacitor integration"
```
