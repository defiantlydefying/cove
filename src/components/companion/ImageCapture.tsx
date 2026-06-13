"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanionAvatar from "./CompanionAvatar";
import type { CompanionType } from "@/lib/companions";

interface ExtractedItem {
  content: string;
  category: "task" | "reminder";
  dueDate: string | null;
  priority?: "high" | "medium";
}

interface ImageCaptureProps {
  companionType: CompanionType;
  onComplete: (message: string) => void;
  onClose: () => void;
}

export default function ImageCapture({ companionType, onComplete, onClose }: ImageCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [summary, setSummary] = useState("");
  const [source, setSource] = useState("");
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!preview || extracting) return;
    setExtracting(true);

    try {
      const res = await fetch("/api/companion/image-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSummary(data.summary || "Here's what I found.");
        setSource(data.source || "");
      }
    } finally {
      setExtracting(false);
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
              priority: item.priority || "medium",
            }),
          });
          if (res.ok) savedCount++;
        } else {
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
        }
      } catch {
        // Continue with other items
      }
    }

    setSaving(false);
    onComplete(`Saved ${savedCount} item${savedCount !== 1 ? "s" : ""} from your screenshot.`);
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
            priority: item.priority || "medium",
          }),
        });
      } else {
        await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.content,
            type: "custom",
            scheduledFor: item.dueDate || undefined,
          }),
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

  // Phase 1: Upload
  if (items.length === 0 && !preview) {
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
              Upload a screenshot and I'll pull out all the tasks and due dates for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Cancel
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-cove-accent/20 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-cove-accent/40 hover:bg-cove-accent/5 transition-all cursor-pointer"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cove-accent">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm text-cove-muted">
            Tap to upload a screenshot
          </span>
          <span className="text-xs text-cove-muted/60">
            Canvas, Blackboard, Google Classroom, syllabi, or any assignment list
          </span>
        </button>
      </motion.div>
    );
  }

  // Phase 2: Preview + extract
  if (items.length === 0 && preview) {
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
              {extracting ? "Reading your screenshot..." : "Got it! Ready to extract tasks?"}
            </p>
          </div>
          <button
            onClick={() => { setPreview(null); }}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Choose different image
          </button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Screenshot preview"
          className="w-full max-h-64 object-contain rounded-xl border border-cove-accent/10"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="px-5 py-2.5 rounded-xl bg-cove-accent text-white text-sm font-medium disabled:opacity-40 hover:bg-cove-accent-hover transition-all"
          >
            {extracting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Extracting...
              </span>
            ) : (
              "Extract tasks"
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Phase 3: Review extracted items
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <CompanionAvatar type={companionType} size="sm" />
        <div>
          <p className="text-sm text-cove-charcoal">{summary}</p>
          {source && source !== "unknown" && (
            <p className="text-xs text-cove-muted">Detected: {source}</p>
          )}
        </div>
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.dueDate && (
                      <span className="text-xs text-cove-muted">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {item.priority === "high" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                        urgent
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
                  item.category === "task" ? "bg-cove-accent/10 text-cove-accent" : "bg-amber-100 text-amber-700"
                }`}>
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
            onClick={() => onComplete("All items from your screenshot have been saved.")}
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
