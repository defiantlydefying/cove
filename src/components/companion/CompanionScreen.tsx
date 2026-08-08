"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CompanionAvatar from "./CompanionAvatar";
import CompanionMessage from "./CompanionMessage";
import CompanionPicker from "./CompanionPicker";
import VoiceInput from "./VoiceInput";
import InboxList from "./InboxList";
import InboxSorter from "./InboxSorter";
import BrainDump from "./BrainDump";
import ImageCapture from "./ImageCapture";
import CrisisResources from "./CrisisResources";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface ChatMessage {
  id: string;
  content: string;
  sender: "companion" | "user";
  source?: "text" | "voice";
  timestamp: Date;
  crisis?: boolean;
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
  const [showPicker, setShowPicker] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "brain-dump" | "image">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch settings first to check if companion is chosen
        const settingsRes = await fetch("/api/settings").catch(() => null);
        let companionChosen = false;

        if (settingsRes?.ok) {
          const settings = await settingsRes.json();
          if (settings.companionType) setCompanionType(settings.companionType);
          companionChosen = settings.companionChosen === true;
        }

        if (!companionChosen) {
          setShowPicker(true);
          setLoaded(true);
          return;
        }

        // Only fetch greeting and inbox after confirming companion is chosen
        const [greetingRes, inboxRes] = await Promise.all([
          fetch("/api/companion/greeting").catch(() => null),
          fetch("/api/inbox?status=unprocessed").catch(() => null),
        ]);

        if (greetingRes?.ok) {
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

        if (inboxRes?.ok) {
          setInboxItems(await inboxRes.json());
        }
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const handlePickCompanion = async (type: CompanionType) => {
    setCompanionType(type);
    setShowPicker(false);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companionType: type, companionChosen: true }),
    });

    const intro = getCompanionCopy(type, "intro");
    setMessages([
      {
        id: "intro",
        content: intro,
        sender: "companion",
        timestamp: new Date(),
      },
    ]);

    const inboxRes = await fetch("/api/inbox?status=unprocessed");
    if (inboxRes.ok) setInboxItems(await inboxRes.json());
  };

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
        // Get AI response first — it tells us whether to save to inbox
        const history = [...messages, userMsg].map((m) => ({
          sender: m.sender,
          content: m.content,
        }));

        const chatRes = await fetch("/api/companion/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content.trim(), history }),
        });

        if (chatRes.ok) {
          const { reply, actionable, crisis } = await chatRes.json();

          // Only save to inbox if the AI deems it actionable
          if (actionable) {
            const inboxRes = await fetch("/api/inbox", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: content.trim(), source }),
            });
            if (inboxRes.ok) {
              const item = await inboxRes.json();
              setInboxItems((prev) => [item, ...prev]);
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              id: `companion-${Date.now()}`,
              content: reply,
              sender: "companion",
              timestamp: new Date(),
              crisis: crisis === true,
            },
          ]);
        } else {
          // Fallback to static copy if AI fails
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
    [sending, companionType, messages]
  );

  const handleConvert = async (id: string, to: "task" | "reminder") => {
    const item = inboxItems.find((i) => i.id === id);
    if (!item) return;

    const shortContent = item.content.length > 40 ? item.content.slice(0, 40) + "..." : item.content;

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
        // Companion acknowledges
        setMessages((prev) => [
          ...prev,
          {
            id: `convert-${Date.now()}`,
            content: `"${shortContent}" is now in your Tasks inbox. You can find it there whenever you're ready.`,
            sender: "companion" as const,
            timestamp: new Date(),
          },
        ]);
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
        // Companion acknowledges
        setMessages((prev) => [
          ...prev,
          {
            id: `convert-${Date.now()}`,
            content: `I'll remind you about "${shortContent}". You can set the exact time in your Reminders.`,
            sender: "companion" as const,
            timestamp: new Date(),
          },
        ]);
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

  const handleUpdateInboxItem = async (id: string, content: string) => {
    setInboxItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, content } : i))
    );
    try {
      const res = await fetch(`/api/inbox/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      const res = await fetch("/api/inbox?status=unprocessed");
      if (res.ok) setInboxItems(await res.json());
    }
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

  if (showPicker) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light tracking-tight text-cove-charcoal mb-3">Choose your companion</h2>
          <p className="text-cove-muted leading-relaxed">
            Your companion will be your guide through cove. Pick the personality that feels right for you.
          </p>
        </div>
        <CompanionPicker
          selected={companionType}
          onSelect={handlePickCompanion}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cove-accent/10">
        <CompanionAvatar type={companionType} size="md" />
        <div>
          <p className="text-sm font-semibold text-cove-charcoal capitalize">{companionType}</p>
          <p className="text-xs text-cove-muted">AI companion · not a person or a substitute for professional care</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            <CompanionMessage
              content={msg.content}
              sender={msg.sender}
              companionType={companionType}
              source={msg.source}
              timestamp={msg.timestamp}
            />
            {msg.crisis && <CrisisResources />}
          </div>
        ))}

        {/* Typing indicator while companion is thinking */}
        {sending && (
          <div className="flex items-start gap-3">
            <CompanionAvatar type={companionType} size="sm" />
            <div className="bg-cove-card border border-cove-accent/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-cove-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-cove-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-cove-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {inboxItems.length > 0 && activeMode === "chat" && (
          <div className="pt-4 space-y-3">
            <InboxList items={inboxItems} onConvert={handleConvert} onDismiss={handleDismiss} onUpdate={handleUpdateInboxItem} />
            <InboxSorter companionType={companionType} onSortComplete={handleSortComplete} />
          </div>
        )}

        {activeMode === "brain-dump" && (
          <div className="pt-2">
            <BrainDump
              companionType={companionType}
              onComplete={(msg) => {
                setActiveMode("chat");
                setMessages((prev) => [
                  ...prev,
                  { id: `bd-${Date.now()}`, content: msg, sender: "companion", timestamp: new Date() },
                ]);
              }}
              onClose={() => setActiveMode("chat")}
            />
          </div>
        )}

        {activeMode === "image" && (
          <div className="pt-2">
            <ImageCapture
              companionType={companionType}
              onComplete={(msg) => {
                setActiveMode("chat");
                setMessages((prev) => [
                  ...prev,
                  { id: `img-${Date.now()}`, content: msg, sender: "companion", timestamp: new Date() },
                ]);
              }}
              onClose={() => setActiveMode("chat")}
            />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-cove-accent/10 px-4 py-3 space-y-2">
        {/* Mode toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode(activeMode === "brain-dump" ? "chat" : "brain-dump")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeMode === "brain-dump"
                ? "bg-cove-accent text-white"
                : "bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
            Brain dump
          </button>
          <button
            onClick={() => setActiveMode(activeMode === "image" ? "chat" : "image")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeMode === "image"
                ? "bg-cove-accent text-white"
                : "bg-cove-accent/10 text-cove-accent hover:bg-cove-accent/20"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Screenshot
          </button>
        </div>

        {/* Chat input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="What's on your mind?"
            className="flex-1 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
            disabled={sending || activeMode !== "chat"}
          />
          <VoiceInput onTranscript={(t) => sendMessage(t, "voice")} disabled={sending || activeMode !== "chat"} />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending || activeMode !== "chat"}
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
