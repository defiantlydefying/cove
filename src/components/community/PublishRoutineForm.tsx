"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface PublishStep {
  title: string;
  durationMinutes?: number | null;
}

interface PublishRoutineFormProps {
  routineName: string;
  steps: PublishStep[];
  startTime?: string | null;
  showTimes?: boolean;
  showDurations?: boolean;
  onPublished: () => void;
  onCancel: () => void;
}

const CONDITION_TAGS = ["ADHD", "Autism", "Anxiety", "Depression", "OCD", "PTSD", "Bipolar", "Dyslexia", "General"];
const TYPE_TAGS = ["Morning", "Evening", "Work", "Self-Care", "Exercise", "Hygiene", "Social", "Wind-Down", "Focus"];

function generateRandomName(): string {
  const adjectives = ["calm", "quiet", "gentle", "warm", "bright", "soft", "kind", "steady", "clear", "still"];
  const nouns = ["river", "fern", "stone", "cloud", "leaf", "moon", "meadow", "ridge", "brook", "pine"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}_${noun}_${num}`;
}

export default function PublishRoutineForm({
  routineName,
  steps,
  startTime,
  showTimes,
  showDurations,
  onPublished,
  onCancel,
}: PublishRoutineFormProps) {
  const [name, setName] = useState(routineName);
  const [description, setDescription] = useState("");
  const [authorNote, setAuthorNote] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  // Fetch existing display name or generate one
  useEffect(() => {
    fetch("/api/user/display-name")
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.displayName ?? generateRandomName());
      })
      .catch(() => {
        setDisplayName(generateRandomName());
      });
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !displayName.trim() || publishing) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/community/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          authorNote: authorNote.trim() || null,
          displayName: displayName.trim(),
          steps,
          startTime,
          showTimes,
          showDurations,
          tags: Array.from(selectedTags),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t publish. Try again.", "error");
        return;
      }
      toast("Routine shared with the community.", "success");
      onPublished();
    } catch {
      toast("Couldn\u2019t publish. Try again.", "error");
    } finally {
      setPublishing(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-cove-border rounded-xl bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-2 focus:ring-cove-accent/30 focus:border-cove-accent transition-colors";

  return (
    <form onSubmit={handlePublish} className="bg-cove-card border border-cove-border-light rounded-xl p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-cove-charcoal">Share to Community</h3>

      <p className="text-xs text-cove-muted -mt-2">
        Share what genuinely helps you. No medical advice, no product promotion.
      </p>

      {/* Name */}
      <div>
        <label className="text-sm font-medium text-cove-charcoal mb-1 block">Routine name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-cove-charcoal mb-1 block">What makes this routine work for you?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Optional — helps others understand the context"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Author note */}
      <div>
        <label className="text-sm font-medium text-cove-charcoal mb-1 block">About you (optional)</label>
        <p className="text-xs text-cove-muted mb-1">
          Sharing context about yourself adds credibility — but only share what you are comfortable with.
        </p>
        <textarea
          value={authorNote}
          onChange={(e) => setAuthorNote(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="e.g. I have ADHD and this morning routine changed my mornings"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Display name */}
      <div>
        <label className="text-sm font-medium text-cove-charcoal mb-1 block">Your display name</label>
        <p className="text-xs text-cove-muted mb-1">
          This is how others will see you. Not your real name.
        </p>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          maxLength={30}
          required
          className={inputClass}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-cove-charcoal mb-1 block">Tags</label>
        <p className="text-xs text-cove-muted mb-2">Help others find this routine</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CONDITION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-cove-accent text-white"
                    : "bg-cove-offwhite text-cove-muted border border-cove-border-light hover:border-cove-accent/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview: steps */}
      <div className="border-t border-cove-border-light pt-3">
        <p className="text-xs font-medium text-cove-muted mb-2">Steps that will be shared ({steps.length})</p>
        <div className="flex flex-col gap-1">
          {steps.map((step, i) => (
            <p key={i} className="text-xs text-cove-charcoal">
              {i + 1}. {step.title}
              {step.durationMinutes ? ` (${step.durationMinutes}m)` : ""}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={publishing || !name.trim() || !displayName.trim()}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? "Publishing..." : "Publish"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm text-cove-muted hover:text-cove-charcoal rounded-xl border border-cove-border-light hover:border-cove-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
