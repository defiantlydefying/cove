"use client";

import { useEffect, useState } from "react";
import CompanionPicker from "@/components/companion/CompanionPicker";
import CoveSwitch from "@/components/ui/CoveSwitch";
import type { CompanionType } from "@/lib/companions";
import { tapLight } from "@/lib/capacitor/haptics";
import { syncStatusBar } from "@/lib/capacitor/status-bar";

const AVAILABLE_MODULES = [
  {
    id: "task-manager",
    name: "Tasks",
    description: "Capture what matters and turn it into doable next steps.",
    defaultEnabled: true,
    recommended: true,
    icon: "check",
  },
  {
    id: "productivity",
    name: "Planner",
    description: "See your week and give important work a place to land.",
    defaultEnabled: true,
    recommended: false,
    icon: "calendar",
  },
  {
    id: "focus-habits",
    name: "Focus & habits",
    description: "Use focus timers, habit check-ins, and weekly goals.",
    defaultEnabled: true,
    recommended: false,
    icon: "focus",
  },
  {
    id: "routine-builder",
    name: "Routines",
    description: "Create gentle structures for the things you repeat.",
    defaultEnabled: true,
    recommended: false,
    icon: "repeat",
  },
  {
    id: "wellness-tracker",
    name: "Wellness",
    description: "Notice patterns in mood, energy, sleep, and wellbeing.",
    defaultEnabled: true,
    recommended: false,
    icon: "heart",
  },
  {
    id: "reminders",
    name: "Reminders",
    description: "Receive low-pressure nudges at the moments you choose.",
    defaultEnabled: true,
    recommended: false,
    icon: "bell",
  },
  {
    id: "gamification",
    name: "Progress",
    description: "Use streaks and small wins when they feel motivating.",
    defaultEnabled: true,
    recommended: false,
    icon: "spark",
  },
  {
    id: "community",
    name: "Community",
    description: "Browse and share routines. This space is always optional.",
    defaultEnabled: true,
    recommended: false,
    icon: "people",
  },
];

const CONDITIONS = [
  "ADHD",
  "Autism / ASD",
  "Anxiety",
  "Depression",
  "Dyslexia",
  "Dyscalculia",
  "OCD",
  "PTSD",
  "Bipolar",
  "Other",
];

const STEP_LABELS = ["Welcome", "About you", "Companion", "Tools", "Style", "Ready"];

interface OnboardingWizardProps {
  onComplete: () => void;
}

function ModuleIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "check") return <svg {...common}><path d="M4 6.5h16v13H4zM8 3.5v5M16 3.5v5M4 10h16" /><path d="m8 15 2 2 5-5" /></svg>;
  if (name === "repeat") return <svg {...common}><path d="M4 7h12l-2.5-2.5M20 17H8l2.5 2.5M18 7a7 7 0 0 1 1 8M6 17a7 7 0 0 1-1-8" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20 8.5c0 5-8 10.5-8 10.5S4 13.5 4 8.5a4.2 4.2 0 0 1 7.2-3l.8.8.8-.8A4.2 4.2 0 0 1 20 8.5Z" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9ZM10 20h4" /></svg>;
  if (name === "people") return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 15a4.5 4.5 0 0 1 6.5 4" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="M8 14h3M13 14h3M8 17h3" /></svg>;
  if (name === "focus") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
  return <svg {...common}><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2ZM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></svg>;
}

function ChoiceCheck() {
  return (
    <span className="onboarding-choice-check" aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 24 24">
        <path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [modules, setModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AVAILABLE_MODULES.map((module) => [module.id, module.defaultEnabled]))
  );
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [animationsOn, setAnimationsOn] = useState(true);
  const [age, setAge] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState("");
  const [profileNotes, setProfileNotes] = useState("");
  const [companionType, setCompanionType] = useState<CompanionType>("fox");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    void syncStatusBar(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const goToStep = (nextStep: number) => {
    void tapLight();
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCondition = (condition: string) => {
    void tapLight();
    setConditions((current) =>
      current.includes(condition)
        ? current.filter((item) => item !== condition)
        : [...current, condition]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const saveSetup = () =>
        fetch("/api/onboarding", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modules,
            settings: { theme, density, animationsOn, companionType },
            profile: {
              age: age ? Number.parseInt(age, 10) : null,
              conditions,
              medications: medications
                ? medications.split(",").map((item) => item.trim()).filter(Boolean)
                : [],
              notes: profileNotes || null,
            },
          }),
        });

      let response = await saveSetup();
      if ([502, 503, 504].includes(response.status)) {
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        response = await saveSetup();
      }

      if (!response.ok) {
        throw new Error("Onboarding settings could not be saved");
      }

      onComplete();
    } catch {
      setSaveError("We couldn’t save your setup. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <main
      className="onboarding-shell"
      data-theme={theme}
      data-density={density}
      data-animations={animationsOn ? "on" : "off"}
    >
      <header className="onboarding-header">
        <div className="onboarding-brand">
          <span className="onboarding-brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 32 32"><path d="M5 24 13 10l4 6 4-4 6 12H5Z" fill="currentColor" /></svg>
          </span>
          <span>Cove</span>
        </div>
        <div className="onboarding-progress-copy">
          <span>{STEP_LABELS[step]}</span>
          <span>{step + 1} of {STEP_LABELS.length}</span>
        </div>
        <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${STEP_LABELS.length}`}>
          <span style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} />
        </div>
      </header>

      <div className="onboarding-body">
        {step === 0 && (
          <section className="onboarding-step onboarding-welcome" data-testid="welcome-step">
            <div className="onboarding-welcome-visual" aria-hidden="true">
              <span className="onboarding-welcome-ring ring-one" />
              <span className="onboarding-welcome-ring ring-two" />
              <span className="onboarding-welcome-core">
                <svg width="46" height="46" viewBox="0 0 64 64"><path d="M8 47 25 20l9 12 9-9 13 24H8Z" fill="currentColor" /></svg>
              </span>
            </div>
            <p className="onboarding-eyebrow">A calmer place to begin</p>
            <h1>Welcome to Cove</h1>
            <p className="onboarding-lede">
              We’ll shape Cove around the way your brain works. Nothing here is permanent, and the personal parts are always optional.
            </p>
            <div className="onboarding-welcome-points">
              <span><ChoiceCheck /> About two minutes</span>
              <span><ChoiceCheck /> Change anything later</span>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-step" data-testid="profile-step">
            <div className="onboarding-step-heading">
              <p className="onboarding-eyebrow">Optional and private</p>
              <h2>A little about you</h2>
              <p>Share only what would help Cove respond more thoughtfully. Skipping everything is completely fine.</p>
            </div>

            <div className="onboarding-form-stack">
              <div className="onboarding-field-card compact-field">
                <div>
                  <label htmlFor="onboarding-age">Your age</label>
                  <p>Used only to adapt language and suggestions.</p>
                </div>
                <input
                  id="onboarding-age"
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Optional"
                  min="13"
                  max="120"
                />
              </div>

              <div className="onboarding-field-card">
                <div className="onboarding-field-heading">
                  <div>
                    <span className="onboarding-field-label">Conditions or diagnoses</span>
                    <p>Select any that feel relevant.</p>
                  </div>
                  <span className="onboarding-optional-label">Optional</span>
                </div>
                <div className="onboarding-chip-grid">
                  {CONDITIONS.map((condition) => {
                    const selected = conditions.includes(condition);
                    return (
                      <button
                        type="button"
                        key={condition}
                        aria-pressed={selected}
                        onClick={() => toggleCondition(condition)}
                        className={selected ? "is-selected" : ""}
                      >
                        {selected && <ChoiceCheck />}
                        {condition}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="onboarding-field-card">
                <label htmlFor="onboarding-medications">Medications</label>
                <p>Add names separated by commas, or leave this blank.</p>
                <input
                  id="onboarding-medications"
                  type="text"
                  value={medications}
                  onChange={(event) => setMedications(event.target.value)}
                  placeholder="Example: Adderall, Lexapro"
                />
              </div>

              <div className="onboarding-field-card">
                <label htmlFor="onboarding-notes">Anything else?</label>
                <p>A preference, challenge, or detail you’d like Cove to remember.</p>
                <textarea
                  id="onboarding-notes"
                  value={profileNotes}
                  onChange={(event) => setProfileNotes(event.target.value)}
                  placeholder="Write as much or as little as you like"
                  rows={3}
                />
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-step" data-testid="companion-step">
            <div className="onboarding-step-heading">
              <p className="onboarding-eyebrow">Your steady presence</p>
              <h2>Choose a companion</h2>
              <p>Pick the personality that feels easiest to have beside you. You can switch anytime.</p>
            </div>
            <CompanionPicker
              selected={companionType}
              onSelect={(type) => {
                void tapLight();
                setCompanionType(type);
              }}
              variant="onboarding"
            />
          </section>
        )}

        {step === 3 && (
          <section className="onboarding-step" data-testid="modules-step">
            <div className="onboarding-step-heading">
              <p className="onboarding-eyebrow">Start simple</p>
              <h2>Choose your tools</h2>
              <p>Everything starts on so you can explore Cove. Turn off anything you don&rsquo;t want right now.</p>
            </div>
            <div className="onboarding-module-list">
              {AVAILABLE_MODULES.map((module) => {
                const enabled = modules[module.id];
                return (
                  <div
                    key={module.id}
                    className={`onboarding-module-card ${enabled ? "is-enabled" : ""}`}
                  >
                    <button
                      type="button"
                      className="onboarding-module-copy"
                      onClick={() => setModules((current) => ({ ...current, [module.id]: !enabled }))}
                    >
                      <span className="onboarding-module-icon"><ModuleIcon name={module.icon} /></span>
                      <span>
                        <span className="onboarding-module-title">
                          {module.name}
                          {module.recommended && <span>Recommended</span>}
                        </span>
                        <span className="onboarding-module-description">{module.description}</span>
                      </span>
                    </button>
                    <CoveSwitch
                      checked={enabled}
                      onCheckedChange={(checked) => {
                        void tapLight();
                        setModules((current) => ({ ...current, [module.id]: checked }));
                      }}
                      label={`${enabled ? "Disable" : "Enable"} ${module.name}`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="onboarding-step onboarding-style-step" data-testid="theme-step">
            <div className="onboarding-step-heading">
              <p className="onboarding-eyebrow">Make it comfortable</p>
              <h2>Choose your style</h2>
              <p>Start with what feels easiest on your eyes. These controls stay in Settings.</p>
            </div>

            <div className="onboarding-preference-group">
              <span className="onboarding-field-label">Appearance</span>
              <div className="onboarding-theme-grid">
                {[
                  { id: "light", label: "Light", colors: ["#f7f5f0", "#fffdf9", "#6b8f71"] },
                  { id: "dark", label: "Dark", colors: ["#1c1b18", "#242220", "#8db893"] },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    aria-pressed={theme === option.id}
                    onClick={() => {
                      void tapLight();
                      setTheme(option.id);
                    }}
                    className={theme === option.id ? "is-selected" : ""}
                  >
                    <span className="onboarding-theme-preview" style={{ background: option.colors[0] }}>
                      <span style={{ background: option.colors[1] }} />
                      <span style={{ background: option.colors[2] }} />
                    </span>
                    <span>{option.label}</span>
                    {theme === option.id && <ChoiceCheck />}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-preference-group">
              <span className="onboarding-field-label">Spacing</span>
              <div className="onboarding-segmented-control">
                {["compact", "comfortable", "spacious"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={density === option}
                    onClick={() => {
                      void tapLight();
                      setDensity(option);
                    }}
                    className={density === option ? "is-selected" : ""}
                  >
                    {option === "comfortable" ? "Balanced" : option}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-preference-row">
              <div>
                <span className="onboarding-field-label">Gentle animations</span>
                <p>Use subtle motion to make changes easier to follow.</p>
              </div>
              <CoveSwitch
                checked={animationsOn}
                onCheckedChange={setAnimationsOn}
                label="Toggle animations"
              />
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="onboarding-step onboarding-done" data-testid="done-step">
            <div className="onboarding-done-mark" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 64 64"><path d="m16 33 10 10 23-25" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="onboarding-eyebrow">That’s everything</p>
            <h2>Your Cove is ready</h2>
            <p>Start with one small thing. Your companion and tools will be waiting, and every choice can change later.</p>
            <div className="onboarding-summary">
              <div><span>Companion</span><strong className="capitalize">{companionType}</strong></div>
              <div><span>Tools enabled</span><strong>{Object.values(modules).filter(Boolean).length}</strong></div>
              <div><span>Appearance</span><strong className="capitalize">{theme}</strong></div>
            </div>
            {saveError && <p className="onboarding-save-error" role="alert">{saveError}</p>}
          </section>
        )}
      </div>

      <footer className="onboarding-actions">
        <div className="onboarding-actions-inner">
          {step > 0 && (
            <button
              type="button"
              className="onboarding-back-button"
              onClick={() => goToStep(step - 1)}
              disabled={saving}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              className="onboarding-next-button"
              onClick={() => goToStep(step + 1)}
            >
              {step === 0 ? "Make Cove mine" : "Continue"}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-next-button"
              onClick={handleComplete}
              disabled={saving}
            >
              {saving ? "Saving your Cove…" : "Enter Cove"}
              {!saving && <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
