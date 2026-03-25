"use client";

import AppShell from "@/components/app-shell/AppShell";
import TaskList from "@/components/tasks/TaskList";
import { useState } from "react";

const defaultTabs = [{ id: "daily-view", label: "Daily View" }];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily-view");

  return (
    <AppShell
      tabs={defaultTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={<TaskList />}
    >
      <div className="text-gray-500">
        <h2 className="text-lg font-medium mb-2">Welcome to Cove</h2>
        <p>Your daily view will appear here.</p>
      </div>
    </AppShell>
  );
}
