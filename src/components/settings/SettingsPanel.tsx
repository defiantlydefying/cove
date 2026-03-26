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
  "#4F7CAC",
  "#E63946",
  "#2A9D8F",
  "#E9C46A",
  "#264653",
  "#F4A261",
];

const ALL_MODULES = [
  { id: "task-manager", name: "Task Manager" },
  { id: "routine-builder", name: "Routine Builder" },
  { id: "wellness-tracker", name: "Wellness Tracker" },
  { id: "reminders", name: "Reminders" },
  { id: "gamification", name: "Gamification" },
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
    <div className="max-w-2xl mx-auto p-8 space-y-8" data-testid="settings-panel">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Theme */}
      <section>
        <h2 className="font-medium mb-2">Theme</h2>
        <div className="flex gap-3">
          <button
            onClick={() => updateSetting("theme", "light")}
            className={`px-4 py-2 border rounded-lg ${
              settings.theme === "light"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => updateSetting("theme", "dark")}
            className={`px-4 py-2 border rounded-lg ${
              settings.theme === "dark"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      {/* Accent Color */}
      <section>
        <h2 className="font-medium mb-2">Accent Color</h2>
        <div className="flex gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateSetting("accentColor", color)}
              aria-label={`Select color ${color}`}
              className={`w-8 h-8 rounded-full border-2 ${
                settings.accentColor === color
                  ? "border-gray-800"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      {/* Density */}
      <section>
        <h2 className="font-medium mb-2">Density</h2>
        <div className="flex gap-3">
          {["compact", "comfortable", "spacious"].map((d) => (
            <label key={d} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="density"
                value={d}
                checked={settings.density === d}
                onChange={() => updateSetting("density", d)}
              />
              <span className="capitalize">{d}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Animations */}
      <section className="flex items-center justify-between">
        <h2 className="font-medium">Animations</h2>
        <button
          onClick={() => updateSetting("animationsOn", !settings.animationsOn)}
          role="switch"
          aria-checked={settings.animationsOn}
          aria-label="Toggle animations"
          className={`w-12 h-6 rounded-full relative transition-colors ${
            settings.animationsOn ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              settings.animationsOn ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </section>

      {/* Sounds */}
      <section className="flex items-center justify-between">
        <h2 className="font-medium">Sounds</h2>
        <button
          onClick={() => updateSetting("soundsOn", !settings.soundsOn)}
          role="switch"
          aria-checked={settings.soundsOn}
          aria-label="Toggle sounds"
          className={`w-12 h-6 rounded-full relative transition-colors ${
            settings.soundsOn ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              settings.soundsOn ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </section>

      {/* Font Size */}
      <section>
        <h2 className="font-medium mb-2">Font Size</h2>
        <div className="flex gap-3">
          {["small", "medium", "large"].map((size) => (
            <label key={size} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={settings.fontSize === size}
                onChange={() => updateSetting("fontSize", size)}
              />
              <span className="capitalize">{size}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Tone */}
      <section>
        <h2 className="font-medium mb-2">Tone</h2>
        <div className="flex gap-3">
          {["casual", "neutral", "encouraging"].map((t) => (
            <label key={t} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="tone"
                value={t}
                checked={settings.tone === t}
                onChange={() => updateSetting("tone", t)}
              />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Module Toggles */}
      <section>
        <h2 className="font-medium mb-3">Modules</h2>
        <div className="space-y-3">
          {ALL_MODULES.map((mod) => {
            const moduleSetting = modules.find((m) => m.moduleId === mod.id);
            const enabled = moduleSetting?.enabled ?? false;
            return (
              <div
                key={mod.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span>{mod.name}</span>
                <button
                  onClick={() => toggleModule(mod.id, !enabled)}
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${mod.name}`}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    enabled ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
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
          className="text-blue-500 hover:underline text-sm"
        >
          Re-run onboarding wizard
        </a>
      </section>
    </div>
  );
}
