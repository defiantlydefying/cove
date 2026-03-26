"use client";

import { useState } from "react";

const AVAILABLE_MODULES = [
  {
    id: "task-manager",
    name: "Task Manager",
    description: "Organize and track your tasks with priorities and deadlines.",
    defaultEnabled: true,
    recommended: true,
  },
  {
    id: "routine-builder",
    name: "Routine Builder",
    description: "Build consistent daily routines step by step.",
    defaultEnabled: false,
    recommended: false,
  },
  {
    id: "wellness-tracker",
    name: "Wellness Tracker",
    description: "Monitor your mood, energy, and wellbeing over time.",
    defaultEnabled: false,
    recommended: false,
  },
  {
    id: "reminders",
    name: "Reminders",
    description: "Gentle nudges to keep you on track throughout the day.",
    defaultEnabled: false,
    recommended: false,
  },
  {
    id: "gamification",
    name: "Gamification",
    description: "Earn points and streaks to stay motivated.",
    defaultEnabled: false,
    recommended: false,
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [modules, setModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const mod of AVAILABLE_MODULES) {
      initial[mod.id] = mod.defaultEnabled;
    }
    return initial;
  });
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [animationsOn, setAnimationsOn] = useState(true);

  const toggleModule = (id: string) => {
    setModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComplete = async () => {
    const modulePromises = Object.entries(modules).map(([moduleId, enabled]) =>
      fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, enabled }),
      })
    );

    const settingsPromise = fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, density, animationsOn }),
    });

    await Promise.all([...modulePromises, settingsPromise]);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {step === 0 && (
        <div data-testid="welcome-step">
          <h1 className="text-3xl font-bold mb-4">Welcome to Cove</h1>
          <p className="text-gray-600 mb-8">
            Your personal executive function companion. Calm by default,
            customizable in every direction.
          </p>
        </div>
      )}

      {step === 1 && (
        <div data-testid="modules-step">
          <h2 className="text-2xl font-bold mb-4">Choose your modules</h2>
          <p className="text-gray-600 mb-6">
            Select the tools you want to start with. You can always change these
            later.
          </p>
          <div className="space-y-3">
            {AVAILABLE_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{mod.name}</span>
                    {mod.recommended && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{mod.description}</p>
                </div>
                <button
                  onClick={() => toggleModule(mod.id)}
                  role="switch"
                  aria-checked={modules[mod.id]}
                  aria-label={`Toggle ${mod.name}`}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    modules[mod.id] ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      modules[mod.id] ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div data-testid="theme-step">
          <h2 className="text-2xl font-bold mb-4">Customize your experience</h2>
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 border rounded-lg ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 border rounded-lg ${
                    theme === "dark"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Density</label>
              <div className="flex gap-3">
                {["compact", "comfortable", "spacious"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-4 py-2 border rounded-lg capitalize ${
                      density === d
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Animations</span>
              <button
                onClick={() => setAnimationsOn((v) => !v)}
                role="switch"
                aria-checked={animationsOn}
                aria-label="Toggle animations"
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  animationsOn ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    animationsOn ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div data-testid="done-step">
          <h2 className="text-2xl font-bold mb-4">Your cove is ready</h2>
          <p className="text-gray-600 mb-8">
            Everything is set up. You can always adjust your settings later.
          </p>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Get started
          </button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Back
          </button>
        )}
        {step === 0 && <div />}
        {step < 3 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg ml-auto"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
