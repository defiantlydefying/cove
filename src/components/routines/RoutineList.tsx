"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { tapLight } from "@/lib/capacitor/haptics";
import RoutineCard, { Routine } from "./RoutineCard";
import RoutineForm, { RoutineFormData } from "./RoutineForm";
import PublishRoutineForm from "@/components/community/PublishRoutineForm";

const TEMPLATES = [
  {
    id: "morning",
    name: "Morning Routine",
    description: "Start your day with energy and focus",
    bg: "bg-cove-amber-light border-cove-amber/30",
    textColor: "text-cove-charcoal",
    subtextColor: "text-cove-muted",
    startTime: "06:00",
    showTimes: true,
    showDurations: true,
    steps: [
      { title: "Stretch for 5 minutes", durationMinutes: 5 },
      { title: "Drink a glass of water", durationMinutes: 5 },
      { title: "Review your goals", durationMinutes: 10 },
      { title: "Eat a healthy breakfast", durationMinutes: 15 },
    ],
  },
  {
    id: "wind-down",
    name: "Wind-Down",
    description: "Ease into a restful evening",
    bg: "bg-cove-sage-light border-cove-sage/30",
    textColor: "text-cove-charcoal",
    subtextColor: "text-cove-muted",
    startTime: "22:00",
    showTimes: true,
    showDurations: true,
    steps: [
      { title: "Put away screens", durationMinutes: 5 },
      { title: "Light stretching or yoga", durationMinutes: 10 },
      { title: "Read for 15 minutes", durationMinutes: 15 },
      { title: "Prepare for tomorrow", durationMinutes: 10 },
    ],
  },
  {
    id: "work-focus",
    name: "Work Focus",
    description: "Get into deep work mode",
    bg: "bg-cove-blue-light border-cove-blue/30",
    textColor: "text-cove-charcoal",
    subtextColor: "text-cove-muted",
    startTime: "09:00",
    showTimes: true,
    showDurations: true,
    steps: [
      { title: "Clear your desk", durationMinutes: 5 },
      { title: "Set today's top 3 priorities", durationMinutes: 10 },
      { title: "Close unnecessary tabs", durationMinutes: 5 },
      { title: "Start a focus timer", durationMinutes: 25 },
    ],
  },
  {
    id: "self-care",
    name: "Self-Care",
    description: "Take time for yourself",
    bg: "bg-cove-terracotta-light border-cove-terracotta/30",
    textColor: "text-cove-charcoal",
    subtextColor: "text-cove-muted",
    startTime: null,
    showTimes: false,
    showDurations: false,
    steps: [
      { title: "Skincare routine", durationMinutes: null },
      { title: "Journal your thoughts", durationMinutes: null },
      { title: "Move your body", durationMinutes: null },
      { title: "Do something you enjoy", durationMinutes: null },
    ],
  },
];

export default function RoutineList() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<RoutineFormData> | undefined>(undefined);
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sharingRoutine, setSharingRoutine] = useState<Routine | null>(null);
  const { toast } = useToast();

  async function fetchRoutines() {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoutines(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoutines();
  }, []);

  async function handleCreate(data: RoutineFormData) {
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setRoutines((prev) => [created, ...prev]);
      setShowForm(false);
      setFormInitialData(undefined);
      toast("Routine created.", "success");
    } catch {
      toast("Couldn\u2019t create routine. Try again.", "error");
    }
  }

  function handleDeleteRequest(routineId: string) {
    setConfirmDeleteId(routineId);
  }

  async function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const prev = routines;
    setRoutines((curr) => curr.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Routine deleted.", "success");
    } catch {
      setRoutines(prev);
      toast("Couldn\u2019t delete routine. Try again.", "error");
    }
  }

  async function handleStepToggle(
    routineId: string,
    stepId: string,
    checked: boolean
  ) {
    if (checked) tapLight();
    setCompletedSteps((prev) => {
      const current = prev[routineId] ?? [];
      const next = checked
        ? [...current, stepId]
        : current.filter((id) => id !== stepId);
      return { ...prev, [routineId]: next };
    });

    try {
      const res = await fetch(`/api/routines/${routineId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, checked }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCompletedSteps((prev) => {
        const current = prev[routineId] ?? [];
        const reverted = checked
          ? current.filter((id) => id !== stepId)
          : [...current, stepId];
        return { ...prev, [routineId]: reverted };
      });
      toast("Couldn\u2019t save step progress. Try again.", "error");
    }
  }

  function handleEdit(_routineId: string) {
    // Edit functionality not yet implemented
  }

  function handleTemplateClick(template: (typeof TEMPLATES)[number]) {
    setFormInitialData({
      name: template.name,
      steps: template.steps,
      startTime: template.startTime,
      showTimes: template.showTimes,
      showDurations: template.showDurations,
    });
    setShowForm(true);
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/routines/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Something went wrong. Try again.");
        return;
      }
      if (data.name && data.steps) {
        setFormInitialData({
          name: data.name,
          steps: (data.steps as string[]).map((s: string) => ({
            title: s,
            durationMinutes: null,
          })),
        });
        setShowForm(true);
        setAiPrompt("");
      }
    } catch {
      setAiError("Could not reach the AI. Check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleNewBlankRoutine() {
    setFormInitialData(undefined);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Routines</h2>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-cove-card border border-cove-border-light p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-semibold text-lg text-cove-charcoal">Routines</h2>
        <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
          <p className="text-cove-muted">Couldn&apos;t load routines.</p>
          <button
            onClick={fetchRoutines}
            className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Creation section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-cove-charcoal">Routines</h2>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setFormInitialData(undefined);
              } else {
                handleNewBlankRoutine();
              }
            }}
            className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors"
          >
            {showForm ? "Cancel" : "+ New routine"}
          </button>
        </div>

        {/* Templates and AI section */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Templates */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-cove-charcoal">
                Start from a template
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`p-3 rounded-xl border ${template.bg} text-left hover:shadow-md hover:scale-[1.02] transition-all`}
                    data-testid={`template-${template.id}`}
                  >
                    <p className={`text-sm font-semibold ${template.textColor}`}>
                      {template.name}
                    </p>
                    <p className={`text-xs ${template.subtextColor} mt-0.5`}>
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Builder */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-cove-charcoal">
                Ask AI to build one
              </p>
              <div className="flex flex-col gap-3 bg-cove-card rounded-xl border border-cove-border-light p-4 h-full justify-center">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Build me a morning routine for ADHD"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-cove-accent/40 text-cove-charcoal placeholder:text-cove-muted resize-none"
                  data-testid="ai-prompt-input"
                />
                {aiError && (
                  <p className="text-sm text-cove-error" role="alert">{aiError}</p>
                )}
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="ai-generate-btn"
                >
                  {aiLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="animate-fade-in-up">
          <RoutineForm
            onSubmit={handleCreate}
            initialData={formInitialData}
          />
        </div>
      )}

      {/* Routines list */}
      <div className="flex flex-col gap-3">
        {routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            completedSteps={completedSteps[routine.id] ?? []}
            onStepToggle={handleStepToggle}
            onDelete={handleDeleteRequest}
            onEdit={handleEdit}
            onShare={setSharingRoutine}
          />
        ))}
      </div>

      {routines.length === 0 && !showForm && (
        <div className="text-center py-8 px-6 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-base font-medium text-cove-charcoal mb-2">Routines bring structure to your day</p>
          <p className="text-sm text-cove-muted leading-relaxed max-w-md mx-auto">
            A routine is a series of small steps you repeat. Pick a template above to get started, or create your own from scratch. You can always adjust the steps later.
          </p>
        </div>
      )}

      {/* Publish form */}
      {sharingRoutine && (
        <div className="animate-fade-in-up">
          <PublishRoutineForm
            routineName={sharingRoutine.name}
            steps={sharingRoutine.steps.map((s) => ({
              title: s.title,
              durationMinutes: s.durationMinutes ?? null,
            }))}
            startTime={sharingRoutine.startTime}
            showTimes={sharingRoutine.showTimes}
            showDurations={sharingRoutine.showDurations}
            onPublished={() => setSharingRoutine(null)}
            onCancel={() => setSharingRoutine(null)}
          />
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-cove-error-light border border-cove-error/20">
          <p className="text-sm text-cove-charcoal flex-1">Delete this routine? This can&apos;t be undone.</p>
          <button
            onClick={handleDeleteConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cove-error text-white hover:bg-cove-error/90 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cove-border text-cove-charcoal hover:bg-cove-border/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
