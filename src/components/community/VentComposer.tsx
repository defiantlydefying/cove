"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface VentComposerProps {
  onCreated: () => void;
  onCancel: () => void;
}

const LIFESPANS = [
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "5d", label: "5 days" },
  { value: "7d", label: "7 days" },
];

const CONTACT_OPTIONS = [
  { value: "both", label: "DMs & replies" },
  { value: "dms", label: "DMs only" },
  { value: "anonymous_replies", label: "Anonymous replies only" },
];

export default function VentComposer({ onCreated, onCancel }: VentComposerProps) {
  const [body, setBody] = useState("");
  const [lifespan, setLifespan] = useState("48h");
  const [contactPreference, setContactPreference] = useState("both");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch("/api/community/vents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          lifespan,
          contactPreference,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t post. Try again.", "error");
        return;
      }
      toast("Vent posted.", "success");
      onCreated();
    } catch {
      toast("Couldn\u2019t post. Try again.", "error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Let it out... this is a safe space."
        rows={4}
        maxLength={2000}
        className="w-full px-4 py-3 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted resize-none"
      />

      <div className="flex items-center justify-between text-xs text-cove-muted">
        <span>{body.length}/2000</span>
      </div>

      <div>
        <p className="text-xs font-medium text-cove-muted mb-1.5">Disappears after</p>
        <div className="flex gap-1.5">
          {LIFESPANS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLifespan(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                lifespan === opt.value
                  ? "bg-cove-accent text-white"
                  : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-cove-muted mb-1.5">How can people reach you?</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTACT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setContactPreference(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                contactPreference === opt.value
                  ? "bg-cove-accent text-white"
                  : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={posting || !body.trim()}
          aria-label="Post"
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {posting ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="px-4 py-2.5 text-sm text-cove-muted hover:text-cove-charcoal rounded-xl border border-cove-border-light hover:border-cove-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
