"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";

interface Tab {
  id: string;
  label: string;
}

interface AppShellProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  sidebarContent: ReactNode;
  children: ReactNode;
}

export default function AppShell({
  tabs,
  activeTab,
  onTabChange,
  sidebarContent,
  children,
}: AppShellProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <span className="text-lg font-semibold">Cove</span>
        {!sidebarVisible && (
          <button
            onClick={() => setSidebarVisible(true)}
            aria-label="Open sidebar"
            className="px-3 py-1 text-sm border rounded"
          >
            Tasks
          </button>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
          <main
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-auto p-4"
          >
            {children}
          </main>
        </div>
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
        >
          {sidebarContent}
        </Sidebar>
      </div>
    </div>
  );
}
