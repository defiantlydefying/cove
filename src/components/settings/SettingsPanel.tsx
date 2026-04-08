"use client";

import { useEffect, useState } from "react";

interface UserSettings {
  theme: string;
  accentColor: string;
  density: string;
  animationsOn: boolean;
  soundsOn: boolean;
  fontSize: string;
  tone: string;
}

interface ModuleSetting {
  moduleId: string;
  enabled: boolean;
}

const ACCENT_COLORS = [
  { hex: "#6B8F71", name: "Sage" },
  { hex: "#7EAAA0", name: "Teal" },
  { hex: "#C4A055", name: "Amber" },
  { hex: "#A08BA0", name: "Heather" },
  { hex: "#4A5D4E", name: "Forest" },
  { hex: "#8FA89A", name: "Mint" },
];

const ALL_MODULES = [
  { id: "task-manager", name: "Task Manager", description: "Organize and track your tasks with priorities and deadlines" },
  { id: "routine-builder", name: "Routine Builder", description: "Build consistent daily routines step by step" },
  { id: "wellness-tracker", name: "Wellness Tracker", description: "Monitor your mood, energy, and wellbeing over time" },
  { id: "reminders", name: "Reminders", description: "Gentle nudges to keep you on track throughout the day" },
  { id: "gamification", name: "Gamification", description: "Earn points and streaks to stay motivated" },
  { id: "community", name: "Community", description: "Browse and share routines with other users" },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [modules, setModules] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [settingsRes, modulesRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/settings/modules"),
      ]);
      const settingsData = await settingsRes.json();
      const modulesData = await modulesRes.json();
      setSettings(settingsData);
      setModules(modulesData);
      setLoading(false);
    }
    load();
  }, []);

  const updateSetting = async (field: string, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    setModules((prev) => {
      const existing = prev.find((m) => m.moduleId === moduleId);
      if (existing) {
        return prev.map((m) =>
          m.moduleId === moduleId ? { ...m, enabled } : m
        );
      }
      return [...prev, { moduleId, enabled }];
    });
    await fetch("/api/settings/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, enabled }),
    });
  };

  if (loading) {
    return <div data-testid="settings-loading">Loading settings...</div>;
  }

  if (!settings) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-10" data-testid="settings-panel">
      <h1 className="text-2xl font-semibold tracking-tight text-cove-charcoal">Settings</h1>

      {/* Theme */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Theme</h2>
          <p className="text-xs text-cove-muted mt-0.5">Choose how Cove looks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateSetting("theme", "light")}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
              settings.theme === "light"
                ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                : "border-cove-border text-cove-muted hover:border-cove-accent/30"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => updateSetting("theme", "dark")}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
              settings.theme === "dark"
                ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                : "border-cove-border text-cove-muted hover:border-cove-accent/30"
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      {/* Accent Color */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Accent Color</h2>
          <p className="text-xs text-cove-muted mt-0.5">Personalize your color scheme</p>
        </div>
        <div className="flex gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => updateSetting("accentColor", color.hex)}
              aria-label={`Select ${color.name}`}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                settings.accentColor === color.hex
                  ? "border-cove-charcoal scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </section>

      {/* Density */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Density</h2>
          <p className="text-xs text-cove-muted mt-0.5">How much space between elements</p>
        </div>
        <div className="flex gap-3">
          {["compact", "comfortable", "spacious"].map((d) => (
            <button
              key={d}
              onClick={() => updateSetting("density", d)}
              className={`px-4 py-2 text-sm border rounded-lg capitalize transition-colors ${
                settings.density === d
                  ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                  : "border-cove-border text-cove-muted hover:border-cove-accent/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-cove-charcoal">Animations</h2>
            <p className="text-xs text-cove-muted mt-0.5">Enable smooth transitions and motion</p>
          </div>
          <button
            onClick={() => updateSetting("animationsOn", !settings.animationsOn)}
            role="switch"
            aria-checked={settings.animationsOn}
            aria-label="Toggle animations"
            className={`w-12 h-6 rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-cove-accent focus-visible:ring-offset-1 ${
              settings.animationsOn ? "bg-cove-accent" : "bg-cove-border"
            }`}
          >
            <span
              className={`block w-5 h-5 bg-cove-card rounded-full absolute top-0.5 transition-transform shadow-sm ${
                settings.animationsOn ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-cove-charcoal">Sounds</h2>
            <p className="text-xs text-cove-muted mt-0.5">Play audio feedback on actions</p>
          </div>
          <button
            onClick={() => updateSetting("soundsOn", !settings.soundsOn)}
            role="switch"
            aria-checked={settings.soundsOn}
            aria-label="Toggle sounds"
            className={`w-12 h-6 rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-cove-accent focus-visible:ring-offset-1 ${
              settings.soundsOn ? "bg-cove-accent" : "bg-cove-border"
            }`}
          >
            <span
              className={`block w-5 h-5 bg-cove-card rounded-full absolute top-0.5 transition-transform shadow-sm ${
                settings.soundsOn ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Font Size */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Font Size</h2>
          <p className="text-xs text-cove-muted mt-0.5">Adjust text size for comfort</p>
        </div>
        <div className="flex gap-3">
          {["small", "medium", "large"].map((size) => (
            <button
              key={size}
              onClick={() => updateSetting("fontSize", size)}
              className={`px-4 py-2 text-sm border rounded-lg capitalize transition-colors ${
                settings.fontSize === size
                  ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                  : "border-cove-border text-cove-muted hover:border-cove-accent/30"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Tone */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Tone</h2>
          <p className="text-xs text-cove-muted mt-0.5">How Cove talks to you</p>
        </div>
        <div className="flex gap-3">
          {["casual", "neutral", "encouraging"].map((t) => (
            <button
              key={t}
              onClick={() => updateSetting("tone", t)}
              className={`px-4 py-2 text-sm border rounded-lg capitalize transition-colors ${
                settings.tone === t
                  ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                  : "border-cove-border text-cove-muted hover:border-cove-accent/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Module Toggles */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Modules</h2>
          <p className="text-xs text-cove-muted mt-0.5">Enable or disable features</p>
        </div>
        <div className="space-y-2">
          {ALL_MODULES.map((mod) => {
            const moduleSetting = modules.find((m) => m.moduleId === mod.id);
            const enabled = moduleSetting?.enabled ?? false;
            return (
              <div
                key={mod.id}
                className="flex items-center justify-between p-4 border border-cove-border-light rounded-xl bg-cove-card"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-cove-charcoal">{mod.name}</span>
                  <p className="text-xs text-cove-muted mt-0.5">{mod.description}</p>
                </div>
                <button
                  onClick={() => toggleModule(mod.id, !enabled)}
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${mod.name}`}
                  className={`w-12 h-6 rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-cove-accent focus-visible:ring-offset-1 shrink-0 ml-4 ${
                    enabled ? "bg-cove-accent" : "bg-cove-border"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-cove-card rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Re-run onboarding */}
      <section>
        <a
          href="/onboarding"
          className="text-sm text-cove-accent hover:text-cove-accent-hover hover:underline"
        >
          Re-run onboarding wizard
        </a>
      </section>
    </div>
  );
}
