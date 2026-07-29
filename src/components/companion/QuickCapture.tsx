"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [imageExtracting, setImageExtracting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Render through a portal to document.body so the fixed button isn't
  // trapped by the transformed/scroll ancestors inside <main>.
  useEffect(() => setMounted(true), []);

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

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;

    setImageExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/companion/image-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          let savedCount = 0;
          for (const item of items) {
            const endpoint = item.category === "task" ? "/api/tasks" : "/api/reminders";
            const body = item.category === "task"
              ? { title: item.content, scheduledDate: item.dueDate || undefined }
              : { title: item.content, type: "custom", scheduledFor: item.dueDate || undefined };
            const saveRes = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (saveRes.ok) savedCount++;
          }
          setAck(data.summary || `Extracted ${savedCount} items from your screenshot.`);
          setTimeout(() => { setAck(null); setOpen(false); }, 2500);
        }
      } finally {
        setImageExtracting(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="quick-capture-fab fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-cove-accent text-white shadow-lg hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 flex items-center justify-center"
          aria-label="Talk to your companion"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

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
              className="quick-capture-sheet fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-cove-offwhite rounded-2xl p-4 shadow-xl border border-cove-border"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="native-sheet-handle" aria-hidden="true" />
              {ack ? (
                <div className="flex items-center gap-3 py-4 justify-center">
                  <CompanionAvatar type={companionType} size="sm" />
                  <p className="text-sm text-cove-charcoal">{ack}</p>
                </div>
              ) : imageExtracting ? (
                <div className="flex items-center gap-3 py-4 justify-center">
                  <CompanionAvatar type={companionType} size="sm" />
                  <p className="text-sm text-cove-charcoal animate-pulse">Reading your screenshot...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CompanionAvatar type={companionType} size="sm" />
                    <span className="text-sm font-medium text-cove-charcoal">Companion</span>
                    <button
                      onClick={() => setOpen(false)}
                      className="ml-auto p-1 rounded-lg text-cove-muted hover:text-cove-charcoal hover:bg-cove-accent/10 transition-colors"
                      aria-label="Close"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="What's on your mind?"
                    className="w-full bg-cove-card border border-cove-accent/20 rounded-xl px-4 py-2.5 text-sm text-cove-charcoal placeholder:text-cove-muted/50 focus:outline-none focus:border-cove-accent/40"
                    disabled={sending}
                  />
                  <div className="flex items-center gap-1 mt-3">
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={sending}
                      className="p-2.5 rounded-xl text-cove-accent hover:bg-cove-accent/10 transition-colors disabled:opacity-40"
                      aria-label="Upload screenshot"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </button>
                    <VoiceInput onTranscript={handleVoice} disabled={sending} />
                    <div className="flex-1" />
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
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
