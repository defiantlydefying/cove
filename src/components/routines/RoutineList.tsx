"use client";

import { useEffect, useState } from "react";
import RoutineCard, { Routine } from "./RoutineCard";
import RoutineForm, { RoutineFormData } from "./RoutineForm";

export default function RoutineList() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>({});

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

  if (loading) {
    return <p className="text-sm text-gray-400">Loading routines...</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm text-gray-700">Routines</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showForm ? "Cancel" : "+ New routine"}
        </button>
      </div>

      {showForm && <RoutineForm onSubmit={handleCreate} />}

      <div className="flex flex-col gap-2">
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
        <p className="text-xs text-gray-400">No routines yet.</p>
      )}
    </div>
  );
}
