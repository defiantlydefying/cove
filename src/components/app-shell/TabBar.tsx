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
  moduleStates?: Record<string, boolean>;
  onToggleModule?: (tabId: string, enabled: boolean) => void;
}

export default function TabBar({
  tabs,
  activeTab,
  onTabChange,
  moduleStates,
  onToggleModule,
}: TabBarProps) {
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
    const buttons =
      tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }

  const showToggles = moduleStates !== undefined && onToggleModule !== undefined;

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className="flex gap-1 px-3 pt-3 pb-0 bg-cove-offwhite"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const isAlwaysOn = tab.id === "daily-view";
        const isEnabled = !showToggles || isAlwaysOn || moduleStates[tab.id] !== false;

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
            className={`relative flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-t-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isActive
                ? "bg-cove-card font-medium shadow-[0_-2px_8px_rgba(107,143,113,0.08)] translate-y-0 scale-100"
                : "bg-transparent hover:bg-cove-card/50 translate-y-0.5 scale-[0.98]"
            } ${
              isEnabled
                ? isActive
                  ? "text-cove-accent"
                  : "text-cove-muted hover:text-cove-charcoal"
                : "text-cove-muted/40"
            }`}
            style={{
              transformOrigin: "bottom center",
            }}
          >
            {tab.label}
            {showToggles && !isAlwaysOn && (
              <span
                role="switch"
                aria-checked={isEnabled}
                aria-label={`Toggle ${tab.label} module`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleModule(tab.id, !isEnabled);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleModule(tab.id, !isEnabled);
                  }
                }}
                tabIndex={0}
                className={`relative inline-flex items-center flex-shrink-0 rounded-full transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cove-accent focus-visible:ring-offset-1 ${
                  isEnabled ? "bg-cove-accent" : "bg-cove-border"
                }`}
                style={{ width: 36, height: 20 }}
              >
                <span
                  className="inline-block rounded-full bg-cove-card shadow transition-all duration-200"
                  style={{
                    width: 16,
                    height: 16,
                    transform: isEnabled
                      ? "translateX(18px)"
                      : "translateX(2px)",
                  }}
                />
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cove-accent rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
