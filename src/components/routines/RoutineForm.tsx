"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface StepData {
  title: string;
  durationMinutes: number | null;
}

export interface RoutineFormData {
  name: string;
  steps: StepData[];
  startTime: string | null;
  showTimes: boolean;
  showDurations: boolean;
}

interface RoutineFormProps {
  onSubmit: (data: RoutineFormData) => void;
  initialData?: Partial<RoutineFormData>;
}

export default function RoutineForm({ onSubmit, initialData }: RoutineFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [steps, setSteps] = useState<StepData[]>(
    initialData?.steps ?? [{ title: "", durationMinutes: null }]
  );
  const [startTime, setStartTime] = useState(initialData?.startTime ?? "09:00");
  const [showTimes, setShowTimes] = useState(initialData?.showTimes ?? false);
  const [showDurations, setShowDurations] = useState(initialData?.showDurations ?? true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState("");
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyError, setModifyError] = useState("");
  const { toast } = useToast();

  function handleAddStep() {
    setSteps((prev) => [...prev, { title: "", durationMinutes: null }]);
  }

  function handleStepTitleChange(index: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, title: value } : s)));
  }

  function handleStepDurationChange(index: number, value: string) {
    const num = value === "" ? null : Math.max(1, parseInt(value) || 1);
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, durationMinutes: num } : s)));
  }

  function handleRemoveStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleToggleTimes(on: boolean) {
    setShowTimes(on);
    if (on) setShowDurations(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const validSteps = steps
      .filter((s) => s.title.trim())
      .map((s) => ({ title: s.title.trim(), durationMinutes: s.durationMinutes }));
    if (!trimmedName || validSteps.length === 0) return;
    onSubmit({
      name: trimmedName,
      steps: validSteps,
      startTime: showTimes ? startTime : null,
      showTimes,
      showDurations,
    });
    if (!initialData) {
      setName("");
      setSteps([{ title: "", durationMinutes: null }]);
      setStartTime("09:00");
      setShowTimes(false);
      setShowDurations(true);
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
          steps: steps.filter((s) => s.title.trim()).map((s) => s.title),
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
      if (prev.length > 0 && prev[prev.length - 1].title.trim() === "") {
        return [...prev.slice(0, -1), { title: suggestion, durationMinutes: null }];
      }
      return [...prev, { title: suggestion, durationMinutes: null }];
    });
    setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));
  }

  async function handleModify() {
    if (!modifyPrompt.trim() || steps.filter((s) => s.title.trim()).length === 0) return;
    setModifyLoading(true);
    setModifyError("");
    try {
      const res = await fetch("/api/routines/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Modify this existing routine called "${name}".\n\nCurrent steps:\n${steps.filter((s) => s.title.trim()).map((s, i) => `${i + 1}. ${s.title}`).join("\n")}\n\nModification requested: ${modifyPrompt.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModifyError(data.error || "Failed to modify. Try again.");
        return;
      }
      if (data.name && data.steps) {
        setName(data.name);
        setSteps(
          (data.steps as string[]).map((s: string) => ({ title: s, durationMinutes: null }))
        );
        setModifyPrompt("");
      }
    } catch {
      setModifyError("Could not reach the AI. Try again.");
    } finally {
      setModifyLoading(false);
    }
  }

  const isEditing = !!initialData;
  const totalMinutes = steps.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

  const inputClass =
    "px-4 py-2.5 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cove-card rounded-xl border border-cove-border-light p-6 flex flex-col gap-4"
    >
      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name your routine..."
        maxLength={100}
        required
        className={`w-full text-base font-medium ${inputClass}`}
      />

      {/* Mode toggles */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={showDurations}
            onChange={(e) => {
              setShowDurations(e.target.checked);
              if (!e.target.checked) setShowTimes(false);
            }}
            className="accent-cove-accent"
          />
          Show durations
        </label>
        <label className="flex items-center gap-2 text-sm text-cove-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={showTimes}
            onChange={(e) => handleToggleTimes(e.target.checked)}
            disabled={!showDurations}
            className="accent-cove-accent"
          />
          Show times
        </label>
        {showTimes && (() => {
          const [h24, min] = startTime.split(":").map(Number);
          const isPM = h24 >= 12;
          const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
          const selClass = "px-2 py-1.5 text-sm border border-cove-border rounded-xl bg-cove-offwhite text-cove-charcoal focus:outline-none focus:ring-2 focus:ring-cove-accent/30 appearance-none cursor-pointer";
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-cove-muted">Starts at</span>
              <select
                value={h12}
                onChange={(e) => {
                  const newH12 = Number(e.target.value);
                  const newH24 = isPM ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12);
                  setStartTime(`${String(newH24).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
                }}
                className={selClass}
                aria-label="Hour"
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-cove-muted">:</span>
              <select
                value={min}
                onChange={(e) => {
                  setStartTime(`${String(h24).padStart(2, "0")}:${String(Number(e.target.value)).padStart(2, "0")}`);
                }}
                className={selClass}
                aria-label="Minute"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
              <select
                value={isPM ? "PM" : "AM"}
                onChange={(e) => {
                  const newPM = e.target.value === "PM";
                  let newH24 = h24;
                  if (newPM && h24 < 12) newH24 = h24 + 12;
                  if (!newPM && h24 >= 12) newH24 = h24 - 12;
                  setStartTime(`${String(newH24).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
                }}
                className={selClass}
                aria-label="AM or PM"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          );
        })()}
        {showDurations && totalMinutes > 0 && (
          <span className="text-xs text-cove-muted ml-auto">{totalMinutes} min total</span>
        )}
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 animate-fade-in-up">
            <div className="flex-shrink-0 text-cove-muted" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>

            <input
              type="text"
              value={step.title}
              onChange={(e) => handleStepTitleChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className={`flex-1 ${inputClass}`}
            />

            {showDurations && (
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={step.durationMinutes ?? ""}
                  onChange={(e) => handleStepDurationChange(index, e.target.value)}
                  placeholder="--"
                  className="w-14 px-2 py-2.5 text-sm text-center bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted"
                  aria-label={`Duration for step ${index + 1} in minutes`}
                />
                <span className="text-xs text-cove-muted">min</span>
              </div>
            )}

            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                aria-label={`Remove step ${index + 1}`}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-cove-muted hover:text-cove-error hover:bg-cove-error-light transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAddStep} className="w-full py-2.5 text-sm text-cove-muted hover:text-cove-charcoal border border-dashed border-cove-border-light rounded-xl hover:border-cove-border transition-colors">
        + Add a step
      </button>

      <button type="button" onClick={handleAskAiSuggestions} disabled={loadingSuggestions || !name.trim()} className="w-full py-2.5 text-sm font-medium text-cove-accent bg-cove-accent-light border border-cove-accent/20 rounded-xl hover:bg-cove-accent-light/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {loadingSuggestions ? "Getting suggestions..." : "Ask AI for suggestions"}
      </button>

      {aiSuggestions.length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-cove-accent-light rounded-xl border border-cove-accent/20">
          <p className="text-xs font-medium text-cove-accent">AI Suggestions -- click to add:</p>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, i) => (
              <button key={i} type="button" onClick={() => handleAddSuggestion(suggestion)} className="px-3 py-1.5 text-sm bg-cove-card text-cove-charcoal rounded-lg border border-cove-accent/20 hover:bg-cove-accent-light hover:border-cove-accent/30 transition-colors">
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {steps.filter((s) => s.title.trim()).length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-cove-offwhite rounded-xl border border-cove-border-light">
          <p className="text-xs font-medium text-cove-muted">Ask AI to modify this routine</p>
          <div className="flex gap-2">
            <input type="text" value={modifyPrompt} onChange={(e) => setModifyPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleModify(); } }} placeholder="e.g. Make it shorter, add a meditation step..." className={`flex-1 px-3 py-2 text-sm bg-cove-card border border-cove-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted`} />
            <button type="button" onClick={handleModify} disabled={modifyLoading || !modifyPrompt.trim()} className="px-4 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
              {modifyLoading ? "Modifying..." : "Modify"}
            </button>
          </div>
          {modifyError && <p className="text-xs text-cove-error">{modifyError}</p>}
        </div>
      )}

      <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all shadow-sm">
        {isEditing ? "Save changes" : "Create routine"}
      </button>
    </form>
  );
}
