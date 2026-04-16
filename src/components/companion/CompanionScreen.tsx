"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CompanionAvatar from "./CompanionAvatar";
import CompanionMessage from "./CompanionMessage";
import VoiceInput from "./VoiceInput";
import InboxList from "./InboxList";
import InboxSorter from "./InboxSorter";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface ChatMessage {
  id: string;
  content: string;
  sender: "companion" | "user";
  source?: "text" | "voice";
  timestamp: Date;
}

interface InboxItemData {
  id: string;
  content: string;
  source: string;
  status: string;
  convertedTo: string | null;
  createdAt: string;
}

export default function CompanionScreen() {
  const [companionType, setCompanionType] = useState<CompanionType>("fox");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItemData[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [greetingRes, inboxRes, settingsRes] = await Promise.all([
          fetch("/api/companion/greeting"),
          fetch("/api/inbox?status=unprocessed"),
          fetch("/api/settings"),
        ]);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.companionType) setCompanionType(settings.companionType);
        }

        if (greetingRes.ok) {
          const { greeting, companionType: ct } = await greetingRes.json();
          if (ct) setCompanionType(ct);
          setMessages([
            {
              id: "greeting",
              content: greeting,
              sender: "companion",
              timestamp: new Date(),
            },
          ]);
        }

        if (inboxRes.ok) {
          setInboxItems(await inboxRes.json());
        }
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string, source: "text" | "voice" = "text") => {
      if (!content.trim() || sending) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        content: content.trim(),
        sender: "user",
        source,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSending(true);

      try {
        const res = await fetch("/api/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim(), source }),
        });

        if (res.ok) {
          const item = await res.json();
          setInboxItems((prev) => [item, ...prev]);

          const ack = getCompanionCopy(companionType, "capture_ack");
          setMessages((prev) => [
            ...prev,
            {
              id: `companion-${Date.now()}`,
              content: ack,
              sender: "companion",
              timestamp: new Date(),
            },
          ]);
        }
      } finally {
        setSending(false);
      }
    },
    [sending, companionType]
  );

  const handleConvert = async (id: string, to: "task" | "reminder") => {
    const item = inboxItems.find((i) => i.id === id);
    if (!item) return;

    if (to === "task") {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.content }),
      });
      if (res.ok) {
        const task = await res.json();
        await fetch(`/api/inbox/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "converted",
            convertedTo: "task",
            convertedId: task.id,
          }),
        });
        setInboxItems((prev) => prev.filter((i) => i.id !== id));
      }
    } else if (to === "reminder") {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.content, type: "custom" }),
      });
      if (res.ok) {
        const reminder = await res.json();
        await fetch(`/api/inbox/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "converted",
            convertedTo: "reminder",
            convertedId: reminder.id,
          }),
        });
        setInboxItems((prev) => prev.filter((i) => i.id !== id));
      }
    }
  };

  const handleDismiss = async (id: string) => {
    await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    setInboxItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSortComplete = async () => {
    const res = await fetch("/api/inbox?status=unprocessed");
    if (res.ok) setInboxItems(await res.json());
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <CompanionAvatar type={companionType} size="lg" className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cove-accent/10">
        <CompanionAvatar type={companionType} size="md" />
        <div>
          <p className="text-sm font-semibold text-cove-charcoal capitalize">{companionType}</p>
          <p className="text-xs text-cove-muted">Your companion</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <CompanionMessage
            key={msg.id}
            content={msg.content}
            sender={msg.sender}
            companionType={companionType}
            source={msg.source}
            timestamp={msg.timestamp}
          />
        ))}

        {inboxItems.length > 0 && (
          <div className="pt-4 space-y-3">
            <InboxList items={inboxItems} onConvert={handleConvert} onDismiss={handleDismiss} />
            <InboxSorter companionType={companionType} onSortComplete={handleSortComplete} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-cove-accent/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="What's on your mind?"
            className="flex-1 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
            disabled={sending}
          />
          <VoiceInput onTranscript={(t) => sendMessage(t, "voice")} disabled={sending} />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-cove-accent text-white disabled:opacity-40 transition-opacity"
            aria-label="Send"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
