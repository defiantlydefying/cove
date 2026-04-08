"use client";

import AppShell from "@/components/app-shell/AppShell";
import TaskList from "@/components/tasks/TaskList";
import RoutineList from "@/components/routines/RoutineList";
import WellnessTracker from "@/components/wellness/WellnessTracker";
import ReminderList from "@/components/reminders/ReminderList";
import DailyView from "@/components/daily/DailyView";
import GamificationPanel from "@/components/gamification/GamificationPanel";
import ProductivityPanel from "@/components/productivity/ProductivityPanel";
import CommunityBrowser from "@/components/community/CommunityBrowser";
import ReminderScheduler from "@/components/reminders/ReminderScheduler";
import WelcomeModal from "@/components/WelcomeModal";
import { useState, useEffect, useCallback } from "react";

const defaultTabs = [
  { id: "daily-view", label: "Daily View" },
  { id: "productivity", label: "Productivity" },
  { id: "routines", label: "Routines" },
  { id: "wellness", label: "Wellness" },
  { id: "reminders", label: "Reminders" },
  { id: "gamification", label: "Progress" },
  { id: "community", label: "Community" },
];

const defaultModuleStates: Record<string, boolean> = {
  routines: true,
  wellness: true,
  reminders: true,
  gamification: true,
  productivity: true,
  community: false,
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily-view");
  const [moduleStates, setModuleStates] =
    useState<Record<string, boolean>>(defaultModuleStates);

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
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  const handleToggleModule = useCallback(
    (tabId: string, enabled: boolean) => {
      setModuleStates((prev) => ({ ...prev, [tabId]: enabled }));

      // If disabling the currently active tab, switch to daily-view
      if (!enabled && activeTab === tabId) {
        setActiveTab("daily-view");
      }

      fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: tabId, enabled }),
      }).catch(() => {
        // Revert on failure
        setModuleStates((prev) => ({ ...prev, [tabId]: !enabled }));
      });
    },
    [activeTab]
  );

  const isModuleEnabled = (tabId: string) =>
    tabId === "daily-view" || moduleStates[tabId] !== false;

  return (
    <AppShell
      tabs={defaultTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={<TaskList />}
      moduleStates={moduleStates}
      onToggleModule={handleToggleModule}
    >
      <ReminderScheduler />
      <WelcomeModal />
      <div key={activeTab} className="animate-soft-bounce">
        {activeTab === "daily-view" && <DailyView />}
        {activeTab === "routines" && isModuleEnabled("routines") && (
          <RoutineList />
        )}
        {activeTab === "wellness" && isModuleEnabled("wellness") && (
          <WellnessTracker />
        )}
        {activeTab === "reminders" && isModuleEnabled("reminders") && (
          <ReminderList />
        )}
        {activeTab === "gamification" && isModuleEnabled("gamification") && (
          <GamificationPanel />
        )}
        {activeTab === "productivity" && isModuleEnabled("productivity") && (
          <ProductivityPanel />
        )}
        {activeTab === "community" && isModuleEnabled("community") && (
          <CommunityBrowser />
        )}
      </div>
    </AppShell>
  );
}
