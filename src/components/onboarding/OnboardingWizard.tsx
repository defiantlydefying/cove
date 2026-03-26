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
    <div className="max-w-2xl mx-auto p-10">
      {step === 0 && (
        <div data-testid="welcome-step">
          <h1 className="text-4xl font-light tracking-tight text-cove-accent mb-3">Welcome to Cove</h1>
          <p className="text-cove-muted mb-10 text-lg leading-relaxed">
            Your personal executive function companion. Calm by default,
            customizable in every direction.
          </p>
        </div>
      )}

      {step === 1 && (
        <div data-testid="modules-step">
          <h2 className="text-2xl font-light tracking-tight text-cove-charcoal mb-3">Choose your modules</h2>
          <p className="text-cove-muted mb-8 leading-relaxed">
            Select the tools you want to start with. You can always change these
            later.
          </p>
          <div className="space-y-3">
            {AVAILABLE_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between p-5 border border-cove-border-light rounded-xl bg-cove-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cove-charcoal">{mod.name}</span>
                    {mod.recommended && (
                      <span className="text-xs bg-cove-accent-light text-cove-accent px-2 py-0.5 rounded-md">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cove-muted mt-0.5">{mod.description}</p>
                </div>
                <button
                  onClick={() => toggleModule(mod.id)}
                  role="switch"
                  aria-checked={modules[mod.id]}
                  aria-label={`Toggle ${mod.name}`}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    modules[mod.id] ? "bg-cove-accent" : "bg-cove-border"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
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
          <h2 className="text-2xl font-light tracking-tight text-cove-charcoal mb-6">Customize your experience</h2>
          <div className="space-y-8">
            <div>
              <label className="block font-medium text-cove-charcoal mb-3">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-5 py-2.5 border rounded-lg transition-colors ${
                    theme === "light"
                      ? "border-cove-accent bg-cove-accent-light text-cove-accent"
                      : "border-cove-border text-cove-muted hover:border-cove-accent/30"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-5 py-2.5 border rounded-lg transition-colors ${
                    theme === "dark"
                      ? "border-cove-accent bg-cove-accent-light text-cove-accent"
                      : "border-cove-border text-cove-muted hover:border-cove-accent/30"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-cove-charcoal mb-3">Density</label>
              <div className="flex gap-3">
                {["compact", "comfortable", "spacious"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-5 py-2.5 border rounded-lg capitalize transition-colors ${
                      density === d
                        ? "border-cove-accent bg-cove-accent-light text-cove-accent"
                        : "border-cove-border text-cove-muted hover:border-cove-accent/30"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-cove-charcoal">Animations</span>
              <button
                onClick={() => setAnimationsOn((v) => !v)}
                role="switch"
                aria-checked={animationsOn}
                aria-label="Toggle animations"
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  animationsOn ? "bg-cove-accent" : "bg-cove-border"
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
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
          <h2 className="text-2xl font-light tracking-tight text-cove-charcoal mb-4">Your cove is ready</h2>
          <p className="text-cove-muted mb-10 leading-relaxed">
            Everything is set up. You can always adjust your settings later.
          </p>
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-cove-accent text-white rounded-lg font-medium shadow-sm hover:bg-cove-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-cove-accent/40"
          >
            Get started
          </button>
        </div>
      )}

      <div className="flex justify-between mt-10">
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-2.5 border border-cove-border rounded-lg text-cove-muted hover:text-cove-charcoal hover:border-cove-accent/30 transition-colors"
          >
            Back
          </button>
        )}
        {step === 0 && <div />}
        {step < 3 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="px-5 py-2.5 bg-cove-accent text-white rounded-lg ml-auto shadow-sm hover:bg-cove-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-cove-accent/40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
