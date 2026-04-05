# Cove iOS App — Capacitor Hybrid Design

## Overview

Wrap the existing Cove Next.js web app in a native iOS shell using Capacitor. The app loads from the deployed production URL with a service worker caching the UI shell for instant loads. Native plugins provide local notifications, haptics, and iOS chrome (status bar, splash screen, safe areas).

## Approach

**Capacitor with Remote URL + Service Worker (Hybrid Mode)**

The native shell is a WebView pointing at the deployed Cove URL. A service worker pre-caches static assets (HTML shell, CSS, JS, fonts, icons) so the app opens instantly on repeat visits. API data always fetches from the network. When offline, the UI shell renders with a banner indicating limited functionality.

This avoids converting Next.js SSR to static export while still feeling native. Web deploys update the app without App Store review; only native plugin changes require a new App Store submission.

## Target

- iOS only (v1)
- Android deferred to a future release

## Project Structure

```
cove/
  capacitor.config.ts          # App ID, server URL, plugin config
  ios/                          # Generated Xcode project
  src/
    lib/
      capacitor/
        index.ts                # isNative(), isIOS() platform detection
        notifications.ts        # Local notification scheduling (native + web fallback)
        haptics.ts              # Haptic feedback (native + no-op fallback)
        status-bar.ts           # iOS status bar style sync with theme
  public/
    manifest.json               # Web app manifest
    sw.js                       # Service worker for shell caching
```

Existing code is unchanged. The `src/lib/capacitor/` modules detect the platform and use native APIs when available, falling back to web APIs (or no-ops) in the browser.

## Native Features (v1)

### 1. Local Notifications

Replace browser Notification API with `@capacitor/local-notifications` when running in Capacitor.

- Notifications fire when app is backgrounded or closed
- Scheduled notifications persist across app restarts
- iOS permissions prompt on first use
- Covers all existing reminder presets: hydration, medication, breaks, self-care, etc.
- The `ReminderScheduler` component detects platform and routes to the appropriate API

Web fallback: existing browser Notification API behavior unchanged.

### 2. Haptics

Light haptic feedback via `@capacitor/haptics` on:

- Completing a task or routine step
- Streak milestone reached
- Focus timer start/stop

Web fallback: no-op (haptics silently skipped).

### 3. Status Bar

`@capacitor/status-bar` syncs the iOS status bar style (light/dark text) with the active Cove theme.

### 4. Splash Screen

`@capacitor/splash-screen` displays Cove branding on app launch, hides once the WebView finishes loading.

## Layout Adjustments

A `capacitor-ios` class is added to `<body>` when running in the native shell. CSS uses `env(safe-area-inset-*)` to pad content away from:

- The notch / Dynamic Island (top)
- The home indicator bar (bottom)

The existing responsive layout (bottom tab bar on mobile, sidebar on desktop) remains unchanged. The only additions are safe area insets.

## Service Worker & Caching

### Cached (loads offline)

- HTML shell (layout frame)
- CSS and JS bundles
- Geist fonts
- Icons and branding assets from `/public/branding/`

### Not cached (network required)

- API responses (tasks, routines, wellness, reminders, gamification)
- Auth sessions

### Strategy

Stale-while-revalidate: serve cached assets immediately, fetch updated versions in the background for the next session.

### Offline State

When the network is unavailable, the UI shell renders and API calls fail gracefully. Existing error states with retry buttons (from the hardening pass) handle failed fetches. A small offline banner appears at the top: "You're offline - some features unavailable."

## Build & Deployment

### Web changes (UI, features, bug fixes)

Deploy to Vercel as usual. The app picks up changes on next open. No App Store review.

### Native changes (new plugins, splash screen, notification behavior)

Rebuild the iOS project in Xcode, archive, submit to App Store.

### Build commands

```bash
npm run build           # Build Next.js
npx cap sync ios        # Sync Capacitor config and plugins to Xcode project
# Open Xcode → Archive → Submit
```

### Capacitor config

```ts
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.cove.companion',
  appName: 'Cove',
  server: {
    url: 'https://your-cove-domain.com', // Replace with production URL
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // Hide manually once WebView loads
      backgroundColor: '#FAF8F5' // Cove warm background
    }
  }
};

export default config;
```

For local development, override the URL to `http://localhost:3000`.

## Not in v1

- Push notifications (requires APNs server infrastructure)
- HealthKit integration
- iOS calendar integration
- Home screen widgets
- Android support
