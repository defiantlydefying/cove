"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import CompanionPicker from "@/components/companion/CompanionPicker";
import CoveSwitch from "@/components/ui/CoveSwitch";
import type { CompanionType } from "@/lib/companions";

interface UserSettings {
  theme: string;
  accentColor: string;
  density: string;
  animationsOn: boolean;
  soundsOn: boolean;
  fontSize: string;
  tone: string;
  companionType: string;
}

interface ModuleSetting {
  moduleId: string;
  enabled: boolean;
}

const ACCENT_COLORS = [
  { hex: "#6B8F71", name: "Sage", hover: "#5A7D60", light: "#EAF0EB", sidebar: "#4A5D4E" },
  { hex: "#7EAAA0", name: "Teal", hover: "#6B9A90", light: "#E6F0ED", sidebar: "#4A5D5E" },
  { hex: "#C4A055", name: "Amber", hover: "#B08E45", light: "#F5EFE0", sidebar: "#5D5440" },
  { hex: "#A08BA0", name: "Heather", hover: "#8E788E", light: "#F0EBF0", sidebar: "#5A4D5A" },
  { hex: "#4A5D4E", name: "Forest", hover: "#3D4F40", light: "#E8EDE9", sidebar: "#3D4F40" },
  { hex: "#8FA89A", name: "Mint", hover: "#7D968A", light: "#ECF2EE", sidebar: "#4A5D50" },
];

function applyAccentColor(hex: string) {
  const color = ACCENT_COLORS.find((c) => c.hex === hex);
  if (!color) return;
  const root = document.documentElement;
  root.style.setProperty("--cove-accent", color.hex);
  root.style.setProperty("--cove-accent-hover", color.hover);
  root.style.setProperty("--cove-accent-light", color.light);
  root.style.setProperty("--cove-sidebar", color.sidebar);
  root.style.setProperty("--cove-gradient-start", color.sidebar);
  root.style.setProperty("--cove-gradient-end", color.hex);
  root.style.setProperty("--cove-selection", color.hex + "33");
}

const ALL_MODULES = [
  { id: "task-manager", name: "Task Manager", description: "Organize and track your tasks with priorities and deadlines" },
  { id: "productivity", name: "Planner", description: "Week calendar with time blocking and priority zones" },
  { id: "focus-habits", name: "Focus & Habits", description: "Pomodoro timer, daily habits, and weekly goals" },
  { id: "routine-builder", name: "Routine Builder", description: "Build consistent daily routines step by step" },
  { id: "wellness-tracker", name: "Wellness Tracker", description: "Monitor your mood, energy, and wellbeing over time" },
  { id: "reminders", name: "Reminders", description: "Gentle nudges to keep you on track throughout the day" },
  { id: "gamification", name: "Gamification", description: "Earn points and streaks to stay motivated" },
  { id: "community", name: "Community", description: "Browse and share routines with other users" },
];

export default function SettingsPanel() {
  const { setTheme } = useTheme();
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
      if (settingsData.accentColor) applyAccentColor(settingsData.accentColor);
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

      {/* Companion */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Companion</h2>
          <p className="text-xs text-cove-muted mt-0.5">Your guide through cove. Switch anytime.</p>
        </div>
        <CompanionPicker
          selected={(settings.companionType ?? "fox") as CompanionType}
          onSelect={(type) => updateSetting("companionType", type)}
        />
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-cove-charcoal">Theme</h2>
          <p className="text-xs text-cove-muted mt-0.5">Choose how Cove looks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { updateSetting("theme", "light"); setTheme("light"); document.documentElement.setAttribute("data-theme", "light"); }}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
              settings.theme === "light"
                ? "border-cove-accent bg-cove-accent-light text-cove-accent font-medium"
                : "border-cove-border text-cove-muted hover:border-cove-accent/30"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => { updateSetting("theme", "dark"); setTheme("dark"); document.documentElement.setAttribute("data-theme", "dark"); }}
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
              onClick={() => { updateSetting("accentColor", color.hex); applyAccentColor(color.hex); }}
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
              onClick={() => { updateSetting("density", d); document.documentElement.setAttribute("data-density", d); }}
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
          <CoveSwitch
            checked={settings.animationsOn}
            onCheckedChange={(checked) => updateSetting("animationsOn", checked)}
            label="Toggle animations"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-cove-charcoal">Sounds</h2>
            <p className="text-xs text-cove-muted mt-0.5">Play audio feedback on actions</p>
          </div>
          <CoveSwitch
            checked={settings.soundsOn}
            onCheckedChange={(checked) => updateSetting("soundsOn", checked)}
            label="Toggle sounds"
          />
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
              onClick={() => { updateSetting("fontSize", size); document.documentElement.setAttribute("data-font-size", size); }}
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
                <CoveSwitch
                  checked={enabled}
                  onCheckedChange={(checked) => toggleModule(mod.id, checked)}
                  label={`Toggle ${mod.name}`}
                  className="ml-4"
                />
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
