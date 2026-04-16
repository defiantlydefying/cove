"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanionAvatar from "./CompanionAvatar";
import VoiceInput from "./VoiceInput";
import type { CompanionType } from "@/lib/companions";
import { getCompanionCopy } from "@/lib/companionCopy";

interface QuickCaptureProps {
  companionType: CompanionType;
}

export default function QuickCapture({ companionType }: QuickCaptureProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [ack, setAck] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = async () => {
    const content = value.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, source: "text" }),
      });
      if (res.ok) {
        setValue("");
        const msg = getCompanionCopy(companionType, "capture_ack");
        setAck(msg);
        setTimeout(() => {
          setAck(null);
          setOpen(false);
        }, 1500);
      }
    } finally {
      setSending(false);
    }
  };

  const handleVoice = async (transcript: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: transcript, source: "voice" }),
      });
      if (res.ok) {
        const msg = getCompanionCopy(companionType, "capture_ack");
        setAck(msg);
        setTimeout(() => {
          setAck(null);
          setOpen(false);
        }, 1500);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-cove-accent text-white shadow-lg hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 flex items-center justify-center"
        aria-label="Quick capture"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-cove-bg rounded-t-2xl p-4 pb-8 shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {ack ? (
                <div className="flex items-center gap-3 py-4 justify-center">
                  <CompanionAvatar type={companionType} size="sm" />
                  <p className="text-sm text-cove-charcoal">{ack}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CompanionAvatar type={companionType} size="sm" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="What's on your mind?"
                    className="flex-1 bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
                    disabled={sending}
                  />
                  <VoiceInput onTranscript={handleVoice} disabled={sending} />
                  <button
                    onClick={submit}
                    disabled={!value.trim() || sending}
                    className="p-2.5 rounded-xl bg-cove-accent text-white disabled:opacity-40 transition-opacity"
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
