"use client";

import AppShell from "@/components/app-shell/AppShell";
import TaskList from "@/components/tasks/TaskList";
import RoutineList from "@/components/routines/RoutineList";
import WellnessTracker from "@/components/wellness/WellnessTracker";
import ReminderList from "@/components/reminders/ReminderList";
import DailyView from "@/components/daily/DailyView";
import GamificationPanel from "@/components/gamification/GamificationPanel";
import ProductivityPanel from "@/components/productivity/ProductivityPanel";
import FocusHabitsPanel from "@/components/productivity/FocusHabitsPanel";
import CommunityBrowser from "@/components/community/CommunityBrowser";
import TasksPage from "@/components/tasks/TasksPage";
import SettingsPanel from "@/components/settings/SettingsPanel";
import ReminderScheduler from "@/components/reminders/ReminderScheduler";
import GuidedTour from "@/components/GuidedTour";
import CompanionScreen from "@/components/companion/CompanionScreen";
import QuickCapture from "@/components/companion/QuickCapture";
import type { CompanionType } from "@/lib/companions";
import { useState, useEffect, useCallback, useRef } from "react";

// SVG icons for nav items
const icons = {
  dailyView: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  productivity: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  routines: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  wellness: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  reminders: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  gamification: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  focusHabits: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  community: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tasks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  companion: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const navItems = [
  { id: "companion", label: "Companion", icon: icons.companion },
  { id: "daily-view", label: "Daily View", icon: icons.dailyView },
  { id: "tasks", label: "Tasks", icon: icons.tasks },
  { id: "productivity", label: "Planner", icon: icons.productivity },
  { id: "focus-habits", label: "Focus & Habits", icon: icons.focusHabits },
  { id: "routines", label: "Routines", icon: icons.routines },
  { id: "wellness", label: "Wellness", icon: icons.wellness },
  { id: "reminders", label: "Reminders", icon: icons.reminders },
  { id: "gamification", label: "Progress", icon: icons.gamification },
  { id: "community", label: "Community", icon: icons.community },
];

const defaultModuleStates: Record<string, boolean> = {
  tasks: true,
  routines: true,
  wellness: true,
  reminders: true,
  gamification: true,
  productivity: true,
  "focus-habits": true,
  community: false,
};

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("companion");
  const [moduleStates, setModuleStates] =
    useState<Record<string, boolean>>(defaultModuleStates);
  const [companionType, setCompanionType] = useState<CompanionType>("fox");
  const sidebarControlRef = useRef<((visible: boolean) => void) | null>(null);

  useEffect(() => {
    fetch("/api/settings/modules")
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((modules: { moduleId: string; enabled: boolean }[]) => {
        if (Array.isArray(modules) && modules.length > 0) {
          const states: Record<string, boolean> = { ...defaultModuleStates };
          for (const m of modules) {
            states[m.moduleId] = m.enabled;
          }
          setModuleStates(states);
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (settings?.companionType) setCompanionType(settings.companionType);
      })
      .catch(() => {});
  }, []);

  const handleToggleModule = useCallback(
    (tabId: string, enabled: boolean) => {
      setModuleStates((prev) => ({ ...prev, [tabId]: enabled }));

      if (!enabled && activeItem === tabId) {
        setActiveItem("daily-view");
      }

      fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: tabId, enabled }),
      }).catch(() => {
        setModuleStates((prev) => ({ ...prev, [tabId]: !enabled }));
      });
    },
    [activeItem]
  );

  const isModuleEnabled = (id: string) =>
    id === "daily-view" || id === "settings" || id === "companion" || moduleStates[id] !== false;

  return (
    <AppShell
      navItems={navItems}
      activeItem={activeItem}
      onItemChange={setActiveItem}
      sidebarContent={<TaskList onNavigateToTasks={() => setActiveItem("tasks")} />}
      moduleStates={moduleStates}
      onToggleModule={handleToggleModule}
      sidebarControlRef={sidebarControlRef}
    >
      <ReminderScheduler />
      <GuidedTour
        setActiveTab={setActiveItem}
        setSidebarVisible={(v) => sidebarControlRef.current?.(v)}
      />
      {activeItem !== "companion" && <QuickCapture companionType={companionType} />}
      <div key={activeItem} className="animate-soft-bounce">
        {activeItem === "companion" && <CompanionScreen />}
        {activeItem === "daily-view" && <DailyView />}
        {activeItem === "tasks" && isModuleEnabled("tasks") && <TasksPage />}
        {activeItem === "routines" && isModuleEnabled("routines") && (
          <RoutineList />
        )}
        {activeItem === "wellness" && isModuleEnabled("wellness") && (
          <WellnessTracker />
        )}
        {activeItem === "reminders" && isModuleEnabled("reminders") && (
          <ReminderList />
        )}
        {activeItem === "gamification" && isModuleEnabled("gamification") && (
          <GamificationPanel />
        )}
        {activeItem === "productivity" && isModuleEnabled("productivity") && (
          <ProductivityPanel />
        )}
        {activeItem === "focus-habits" && isModuleEnabled("focus-habits") && (
          <FocusHabitsPanel />
        )}
        {activeItem === "community" && isModuleEnabled("community") && (
          <CommunityBrowser />
        )}
        {activeItem === "settings" && <SettingsPanel />}
      </div>
    </AppShell>
  );
}
