"use client";

import { useState } from "react";

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
    }
  }

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border rounded p-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Routine name"
        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
      <div className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-1">
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="flex-1 px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                aria-label={`Remove step ${index + 1}`}
                className="text-gray-400 hover:text-red-500 text-xs px-1"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddStep}
        className="text-xs text-gray-500 hover:text-gray-700 self-start"
      >
        + Add step
      </button>
      <button
        type="submit"
        className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
      >
        {isEditing ? "Save changes" : "Create routine"}
      </button>
    </form>
  );
}
