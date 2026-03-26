"use client";

import AppShell from "@/components/app-shell/AppShell";
import TaskList from "@/components/tasks/TaskList";
import RoutineList from "@/components/routines/RoutineList";
import WellnessTracker from "@/components/wellness/WellnessTracker";
import ReminderList from "@/components/reminders/ReminderList";
import DailyView from "@/components/daily/DailyView";
import GamificationPanel from "@/components/gamification/GamificationPanel";
import { useState } from "react";

const defaultTabs = [
  { id: "daily-view", label: "Daily View" },
  { id: "routines", label: "Routines" },
  { id: "wellness", label: "Wellness" },
  { id: "reminders", label: "Reminders" },
  { id: "gamification", label: "Progress" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily-view");

  return (
    <AppShell
      tabs={defaultTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={<TaskList />}
    >
      <div key={activeTab} className="animate-soft-bounce">
        {activeTab === "daily-view" && <DailyView />}
        {activeTab === "routines" && <RoutineList />}
        {activeTab === "wellness" && <WellnessTracker />}
        {activeTab === "reminders" && <ReminderList />}
        {activeTab === "gamification" && <GamificationPanel />}
      </div>
    </AppShell>
  );
}
