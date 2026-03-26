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
      <header className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cove-gradient-start to-cove-gradient-end text-white shadow-sm">
        <span className="text-lg font-semibold tracking-tight">Cove</span>
        {!sidebarVisible && (
          <button
            onClick={() => setSidebarVisible(true)}
            aria-label="Open sidebar"
            className="px-3 py-1.5 text-sm border border-white/30 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Tasks
          </button>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 bg-cove-offwhite">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
          <main
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-auto p-5"
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
