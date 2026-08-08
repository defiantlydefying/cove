"use client";

import { useSyncExternalStore } from "react";

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOfflineSnapshot() {
  return !navigator.onLine;
}

export default function OfflineBanner() {
  const offline = useSyncExternalStore(
    subscribeToConnection,
    getOfflineSnapshot,
    () => false
  );

  if (!offline) return null;

  return (
    <div
      role="status"
      className="bg-cove-amber/15 text-cove-charcoal text-sm text-center py-2 px-4 border-b border-cove-amber/30"
    >
      You&rsquo;re offline - some features unavailable
    </div>
  );
}
