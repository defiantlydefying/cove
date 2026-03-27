"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface RoutineFormData {
  name: string;
  steps: string[];
}

interface RoutineFormProps {
  onSubmit: (data: RoutineFormData) => void;
  initialData?: RoutineFormData;
}

export default function RoutineForm({ onSubmit, initialData }: RoutineFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [steps, setSteps] = useState<string[]>(
    initialData?.steps ?? [""]
  );
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState("");
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyError, setModifyError] = useState("");
  const { toast } = useToast();

  function handleAddStep() {
    setSteps((prev) => [...prev, ""]);
  }

  function handleStepChange(index: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleRemoveStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (!trimmedName || trimmedSteps.length === 0) return;
    onSubmit({ name: trimmedName, steps: trimmedSteps });
    if (!initialData) {
      setName("");
      setSteps([""]);
      setAiSuggestions([]);
    }
  }

  async function handleAskAiSuggestions() {
    if (!name.trim()) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/routines/suggest-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          steps: steps.filter((s) => s.trim()),
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions ?? []);
    } catch {
      toast("Couldn\u2019t get suggestions. Try again.", "error");
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function handleAddSuggestion(suggestion: string) {
    setSteps((prev) => {
      // If the last step is empty, replace it
      if (prev.length > 0 && prev[prev.length - 1].trim() === "") {
        return [...prev.slice(0, -1), suggestion];
      }
      return [...prev, suggestion];
    });
    setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));
  }

  async function handleModify() {
    if (!modifyPrompt.trim() || steps.filter(s => s.trim()).length === 0) return;
    setModifyLoading(true);
    setModifyError("");
    try {
      const res = await fetch("/api/routines/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Modify this existing routine called "${name}".\n\nCurrent steps:\n${steps.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nModification requested: ${modifyPrompt.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModifyError(data.error || "Failed to modify. Try again.");
        return;
      }
      if (data.name && data.steps) {
        setName(data.name);
        setSteps(data.steps);
        setModifyPrompt("");
      }
    } catch {
      setModifyError("Could not reach the AI. Try again.");
    } finally {
      setModifyLoading(false);
    }
  }

  const isEditing = !!initialData;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cove-card rounded-xl border border-cove-border-light p-6 flex flex-col gap-4 shadow-sm"
    >
      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name your routine..."
        maxLength={100}
        required
        className="w-full px-4 py-3 text-base font-medium bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted"
      />

      {/* Steps list */}
      <div className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-2 animate-fade-in-up"
          >
            {/* Drag handle (visual only) */}
            <div className="flex-shrink-0 text-cove-muted cursor-grab" aria-label="Drag handle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>

            {/* Step input */}
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="flex-1 px-4 py-2.5 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted"
            />

            {/* Remove button */}
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                aria-label={`Remove step ${index + 1}`}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-cove-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add step button */}
      <button
        type="button"
        onClick={handleAddStep}
        className="w-full py-2.5 text-sm text-cove-muted hover:text-cove-charcoal border border-dashed border-cove-border-light rounded-xl hover:border-cove-border transition-colors"
      >
        + Add a step
      </button>

      {/* AI suggestions button */}
      <button
        type="button"
        onClick={handleAskAiSuggestions}
        disabled={loadingSuggestions || !name.trim()}
        className="w-full py-2.5 text-sm font-medium text-cove-accent bg-cove-accent-light border border-cove-accent/20 rounded-xl hover:bg-cove-accent-light/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingSuggestions ? "Getting suggestions..." : "Ask AI for suggestions"}
      </button>

      {/* AI suggestions display */}
      {aiSuggestions.length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-cove-accent-light rounded-xl border border-cove-accent/20">
          <p className="text-xs font-medium text-cove-accent">
            AI Suggestions -- click to add:
          </p>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddSuggestion(suggestion)}
                className="px-3 py-1.5 text-sm bg-cove-card text-cove-charcoal rounded-lg border border-cove-accent/20 hover:bg-cove-accent-light hover:border-cove-accent/30 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Modify section -- only show when there are steps */}
      {steps.filter(s => s.trim()).length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-cove-offwhite rounded-xl border border-cove-border-light">
          <p className="text-xs font-medium text-cove-muted">
            Ask AI to modify this routine
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleModify(); } }}
              placeholder="e.g. Make it shorter, add a meditation step, shift everything 30 min later..."
              className="flex-1 px-3 py-2 text-sm bg-cove-card border border-cove-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted"
            />
            <button
              type="button"
              onClick={handleModify}
              disabled={modifyLoading || !modifyPrompt.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {modifyLoading ? "Modifying..." : "Modify"}
            </button>
          </div>
          {modifyError && (
            <p className="text-xs text-red-400">{modifyError}</p>
          )}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="w-full py-3 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all shadow-sm"
      >
        {isEditing ? "Save changes" : "Create routine"}
      </button>
    </form>
  );
}
