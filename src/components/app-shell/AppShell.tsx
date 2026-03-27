"use client";

import { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
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
  moduleStates?: Record<string, boolean>;
  onToggleModule?: (tabId: string, enabled: boolean) => void;
}

export default function AppShell({
  tabs,
  activeTab,
  onTabChange,
  sidebarContent,
  children,
  moduleStates,
  onToggleModule,
}: AppShellProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { data: session } = useSession();
  const userName = session?.user?.name;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-5 py-3.5 bg-cove-sidebar text-cove-sidebar-text shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight leading-none">Cove</span>
          <span className="opacity-30">|</span>
          <span className="text-sm opacity-70">
            {userName ? `Welcome, ${userName}` : "Your cove."}
          </span>
        </div>
        {!sidebarVisible && (
          <button
            onClick={() => setSidebarVisible(true)}
            aria-label="Open sidebar"
            className="px-3 py-1.5 text-sm border border-cove-sidebar-text/30 rounded-lg opacity-80 hover:opacity-100 hover:bg-cove-sidebar-text/10 transition-colors"
          >
            Tasks
          </button>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 bg-cove-offwhite">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            moduleStates={moduleStates}
            onToggleModule={onToggleModule}
          />
          <main
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-auto p-5 bg-cove-card rounded-tl-3xl"
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
