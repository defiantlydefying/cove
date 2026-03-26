"use client";

import { useRef } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }
    e.preventDefault();
    onTabChange(tabs[nextIndex].id);
    const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className="flex gap-1 px-3 pt-3 pb-0 bg-cove-offwhite"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative px-5 py-2.5 text-sm rounded-t-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isActive
                ? "bg-cove-card text-cove-accent font-medium shadow-[0_-2px_8px_rgba(123,111,212,0.08)] translate-y-0 scale-100"
                : "bg-transparent text-cove-muted hover:text-cove-charcoal hover:bg-cove-card/50 translate-y-0.5 scale-[0.98]"
            }`}
            style={{
              transformOrigin: "bottom center",
            }}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cove-accent to-cove-blue rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
