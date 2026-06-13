"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanionAvatar from "./CompanionAvatar";
import VoiceInput from "./VoiceInput";
import type { CompanionType } from "@/lib/companions";

interface ParsedItem {
  content: string;
  category: "task" | "reminder" | "note";
  dueDate: string | null;
}

interface BrainDumpProps {
  companionType: CompanionType;
  onComplete: (message: string) => void;
  onClose: () => void;
}

export default function BrainDump({ companionType, onComplete, onClose }: BrainDumpProps) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [summary, setSummary] = useState("");
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoice = (transcript: string) => {
    setText((prev) => (prev ? prev + " " + transcript : transcript));
    textareaRef.current?.focus();
  };

  const handleParse = async () => {
    if (!text.trim() || parsing) return;
    setParsing(true);

    try {
      const res = await fetch("/api/companion/brain-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSummary(data.summary || "Got it all sorted.");
      }
    } finally {
      setParsing(false);
    }
  };

  const handleAcceptAll = async () => {
    setSaving(true);
    const toSave = items.filter((_, i) => !dismissed.has(i));
    let savedCount = 0;

    for (const item of toSave) {
      try {
        if (item.category === "task") {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.content,
              scheduledDate: item.dueDate || undefined,
            }),
          });
          if (res.ok) savedCount++;
        } else if (item.category === "reminder") {
          const res = await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.content,
              type: "custom",
              scheduledFor: item.dueDate || undefined,
            }),
          });
          if (res.ok) savedCount++;
        } else {
          // Notes go to inbox
          const res = await fetch("/api/inbox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: item.content, source: "brain-dump" }),
          });
          if (res.ok) savedCount++;
        }
      } catch {
        // Continue with other items
      }
    }

    setSaving(false);
    onComplete(
      `Saved ${savedCount} item${savedCount !== 1 ? "s" : ""} from your brain dump. Your head should feel a little lighter now.`
    );
  };

  const handleAcceptSingle = async (index: number) => {
    const item = items[index];
    if (!item) return;

    setAccepted((prev) => new Set(prev).add(index));

    try {
      if (item.category === "task") {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.content,
            scheduledDate: item.dueDate || undefined,
          }),
        });
      } else if (item.category === "reminder") {
        await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.content,
            type: "custom",
            scheduledFor: item.dueDate || undefined,
          }),
        });
      } else {
        await fetch("/api/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: item.content, source: "brain-dump" }),
        });
      }
    } catch {
      setAccepted((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleDismiss = (index: number) => {
    setDismissed((prev) => new Set(prev).add(index));
  };

  const allHandled = items.length > 0 && items.every((_, i) => accepted.has(i) || dismissed.has(i));

  const categoryColors: Record<string, string> = {
    task: "bg-cove-accent/10 text-cove-accent",
    reminder: "bg-amber-100 text-amber-700",
    note: "bg-purple-100 text-purple-700",
  };

  // Phase 1: Input
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CompanionAvatar type={companionType} size="sm" />
            <p className="text-sm text-cove-charcoal">
              Empty your head. Type everything, no need to organize — I'll sort it out.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Cancel
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I need to finish my essay for English class, also I have a dentist appointment on Thursday, and I keep forgetting to text mom back, oh and there's that group project meeting..."
          className="w-full h-40 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-3 text-sm text-cove-charcoal placeholder:text-cove-muted/40 focus:outline-none focus:border-cove-accent/40 resize-none leading-relaxed"
          autoFocus
        />

        <div className="flex items-center justify-between">
          <VoiceInput onTranscript={handleVoice} disabled={parsing} />
          <button
            onClick={handleParse}
            disabled={!text.trim() || parsing}
            className="px-5 py-2.5 rounded-xl bg-cove-accent text-white text-sm font-medium disabled:opacity-40 hover:bg-cove-accent-hover transition-all"
          >
            {parsing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sorting your thoughts...
              </span>
            ) : (
              "Sort it out"
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Phase 2: Review parsed items
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <CompanionAvatar type={companionType} size="sm" />
        <p className="text-sm text-cove-charcoal">{summary}</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, i) => {
            const isAccepted = accepted.has(i);
            const isDismissed = dismissed.has(i);
            if (isDismissed) return null;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isAccepted
                    ? "border-cove-accent/20 bg-cove-accent/5 opacity-60"
                    : "border-cove-accent/10 bg-cove-card"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cove-charcoal">{item.content}</p>
                  {item.dueDate && (
                    <p className="text-xs text-cove-muted mt-0.5">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${categoryColors[item.category]}`}>
                  {item.category}
                </span>
                {!isAccepted && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleAcceptSingle(i)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDismiss(i)}
                      className="text-xs px-2.5 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal hover:bg-cove-accent/5 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                )}
                {isAccepted && (
                  <span className="text-xs text-cove-accent shrink-0">Saved</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-2">
        {!allHandled && (
          <button
            onClick={handleAcceptAll}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-cove-accent text-white text-sm hover:bg-cove-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save all"}
          </button>
        )}
        {allHandled && (
          <button
            onClick={() => onComplete("All done! Your brain dump has been sorted.")}
            className="text-sm text-cove-accent hover:underline"
          >
            Back to chat
          </button>
        )}
        <button
          onClick={onClose}
          className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
