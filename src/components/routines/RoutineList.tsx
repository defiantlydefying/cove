"use client";

import { useEffect, useState } from "react";
import RoutineCard, { Routine } from "./RoutineCard";
import RoutineForm, { RoutineFormData } from "./RoutineForm";

const TEMPLATES = [
  {
    id: "morning",
    name: "Morning Routine",
    description: "Start your day with energy and focus",
    gradient: "from-amber-500 to-orange-400",
    steps: ["Stretch for 5 minutes", "Drink a glass of water", "Review your goals", "Eat a healthy breakfast"],
  },
  {
    id: "wind-down",
    name: "Wind-Down",
    description: "Ease into a restful evening",
    gradient: "from-indigo-500 to-purple-400",
    steps: ["Put away screens", "Light stretching or yoga", "Read for 15 minutes", "Prepare for tomorrow"],
  },
  {
    id: "work-focus",
    name: "Work Focus",
    description: "Get into deep work mode",
    gradient: "from-blue-500 to-cyan-400",
    steps: ["Clear your desk", "Set today's top 3 priorities", "Close unnecessary tabs", "Start a focus timer"],
  },
  {
    id: "self-care",
    name: "Self-Care",
    description: "Take time for yourself",
    gradient: "from-pink-500 to-rose-400",
    steps: ["Skincare routine", "Journal your thoughts", "Move your body", "Do something you enjoy"],
  },
];

export default function RoutineList() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<RoutineFormData | undefined>(undefined);
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetch("/api/routines")
      .then((res) => res.json())
      .then((data) => {
        setRoutines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(data: RoutineFormData) {
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setRoutines((prev) => [created, ...prev]);
      setShowForm(false);
      setFormInitialData(undefined);
    } catch {
      // silently fail
    }
  }

  async function handleDelete(routineId: string) {
    const prev = routines;
    setRoutines((curr) => curr.filter((r) => r.id !== routineId));
    try {
      await fetch(`/api/routines/${routineId}`, { method: "DELETE" });
    } catch {
      setRoutines(prev);
    }
  }

  async function handleStepToggle(
    routineId: string,
    stepId: string,
    checked: boolean
  ) {
    setCompletedSteps((prev) => {
      const current = prev[routineId] ?? [];
      const next = checked
        ? [...current, stepId]
        : current.filter((id) => id !== stepId);
      return { ...prev, [routineId]: next };
    });

    try {
      await fetch(`/api/routines/${routineId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, checked }),
      });
    } catch {
      setCompletedSteps((prev) => {
        const current = prev[routineId] ?? [];
        const reverted = checked
          ? current.filter((id) => id !== stepId)
          : [...current, stepId];
        return { ...prev, [routineId]: reverted };
      });
    }
  }

  function handleEdit(routineId: string) {
    // Placeholder for edit functionality
    console.log("Edit routine", routineId);
  }

  function handleTemplateClick(template: (typeof TEMPLATES)[number]) {
    setFormInitialData({ name: template.name, steps: template.steps });
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
        setFormInitialData({ name: data.name, steps: data.steps });
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
    return <p className="text-sm text-cove-muted">Loading routines...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Creation section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-cove-charcoal">Routines</h2>
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
                    className={`p-3 rounded-xl bg-gradient-to-br ${template.gradient} text-left hover:shadow-md hover:scale-[1.02] transition-all`}
                    data-testid={`template-${template.id}`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {template.name}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
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
                  className="w-full px-4 py-3 text-sm bg-cove-offwhite border border-cove-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-cove-charcoal placeholder:text-cove-muted resize-none"
                  data-testid="ai-prompt-input"
                />
                {aiError && (
                  <p className="text-sm text-red-400">{aiError}</p>
                )}
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {routines.length === 0 && !showForm && (
        <p className="text-sm text-cove-muted text-center py-6">
          No routines yet. Pick a template or create your own above.
        </p>
      )}
    </div>
  );
}
