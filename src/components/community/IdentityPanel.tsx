"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import AvatarDisplay from "./AvatarDisplay";

export default function IdentityPanel() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingName, setRegeneratingName] = useState(false);
  const [regeneratingAvatar, setRegeneratingAvatar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch("/api/user/display-name").then((r) => r.ok ? r.json() : null),
      fetch("/api/user/avatar").then((r) => r.ok ? r.json() : null),
    ])
      .then(([nameData, avatarData]) => {
        setDisplayName(nameData?.displayName ?? null);
        setAvatarKey(avatarData?.current ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRegenerateName() {
    setRegeneratingName(true);
    try {
      const res = await fetch("/api/user/display-name/regenerate", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDisplayName(data.displayName);
      toast("New name generated!", "success");
    } catch {
      toast("Couldn\u2019t regenerate name.", "error");
    } finally {
      setRegeneratingName(false);
    }
  }

  async function handleRegenerateAvatar() {
    setRegeneratingAvatar(true);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvatarKey(data.avatarKey);
      toast("New avatar assigned!", "success");
    } catch {
      toast("Couldn\u2019t regenerate avatar.", "error");
    } finally {
      setRegeneratingAvatar(false);
    }
  }

  if (loading) {
    return <div className="h-16 rounded-xl bg-cove-border-light animate-pulse" />;
  }

  return (
    <div className="bg-cove-card border border-cove-border-light rounded-xl px-4 py-3 flex items-center gap-3">
      <AvatarDisplay avatarKey={avatarKey} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-cove-charcoal truncate">
          {displayName ?? "anonymous"}
        </p>
        <p className="text-xs text-cove-muted">Your community identity</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleRegenerateName}
          disabled={regeneratingName}
          title="New random name"
          className="p-1.5 text-cove-muted hover:text-cove-accent transition-colors rounded-lg hover:bg-cove-offwhite disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={handleRegenerateAvatar}
          disabled={regeneratingAvatar}
          title="New random avatar"
          className="p-1.5 text-cove-muted hover:text-cove-accent transition-colors rounded-lg hover:bg-cove-offwhite disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
