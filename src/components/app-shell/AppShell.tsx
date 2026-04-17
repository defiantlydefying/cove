"use client";

import { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LeftNav from "./LeftNav";
import Sidebar from "./Sidebar";
import OfflineBanner from "@/components/OfflineBanner";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  navItems: NavItem[];
  activeItem: string;
  onItemChange: (id: string) => void;
  sidebarContent: ReactNode;
  children: ReactNode;
  moduleStates?: Record<string, boolean>;
  onToggleModule?: (tabId: string, enabled: boolean) => void;
  sidebarControlRef?: React.MutableRefObject<((visible: boolean) => void) | null>;
}

export default function AppShell({
  navItems,
  activeItem,
  onItemChange,
  sidebarContent,
  children,
  moduleStates,
  onToggleModule,
  sidebarControlRef,
}: AppShellProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { data: session } = useSession();
  const userName = session?.user?.name;

  // Expose sidebar control to parent (for guided tour)
  useEffect(() => {
    if (sidebarControlRef) {
      sidebarControlRef.current = setSidebarVisible;
    }
  }, [sidebarControlRef]);

  // Show sidebar by default on desktop
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setSidebarVisible(isDesktop);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <OfflineBanner />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-cove-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Left navigation */}
      <LeftNav
        items={navItems}
        activeItem={activeItem}
        onItemChange={onItemChange}
        moduleStates={moduleStates}
        onToggleModule={onToggleModule}
        userName={userName}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-cove-border-light bg-cove-card shrink-0">
          <div className="flex items-center gap-2">
            {/* Spacer for mobile hamburger */}
            <div className="w-8 md:hidden" />
            <h1 className="text-lg font-semibold text-cove-charcoal tracking-tight">
              {navItems.find((i) => i.id === activeItem)?.label ?? "Cove"}
            </h1>
          </div>
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            aria-label={sidebarVisible ? "Close tasks" : "Open tasks"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cove-muted hover:text-cove-charcoal border border-cove-border rounded-lg hover:bg-cove-offwhite transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            Tasks
          </button>
        </header>

        {/* Content + sidebar row */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main
            id="main-content"
            className="flex-1 overflow-auto p-6 bg-cove-offwhite"
          >
            {children}
          </main>

          <Sidebar
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
          >
            {sidebarContent}
          </Sidebar>
        </div>
      </div>
    </div>
  );
}
