"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface LeftNavProps {
  items: NavItem[];
  activeItem: string;
  onItemChange: (id: string) => void;
  moduleStates?: Record<string, boolean>;
  onToggleModule?: (id: string, enabled: boolean) => void;
  userName?: string | null;
}

const PINNED_KEY = "cove-nav-pinned";
const NAV_WIDTH = 224;
const RAIL_WIDTH = 56;

export default function LeftNav({
  items,
  activeItem,
  onItemChange,
  moduleStates,
  onToggleModule,
  userName,
}: LeftNavProps) {
  const [pinned, setPinned] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Load pinned preference
  useEffect(() => {
    const saved = localStorage.getItem(PINNED_KEY);
    // This client-only preference is intentionally restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "false") setPinned(false);
  }, []);

  const togglePin = useCallback(() => {
    setPinned((p) => {
      const next = !p;
      localStorage.setItem(PINNED_KEY, String(next));
      return next;
    });
  }, []);

  const expanded = pinned || hovering || mobileOpen;

  const handleMouseEnter = () => {
    if (pinned) return;
    hoverTimer.current = setTimeout(() => setHovering(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovering(false);
  };

  const handleItemClick = (id: string) => {
    onItemChange(id);
    setMobileOpen(false);
  };

  // Close mobile nav on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  const showToggles = moduleStates !== undefined && onToggleModule !== undefined;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        id="mobile-nav-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="native-safe-top-offset fixed top-3 left-3 z-50 p-2 rounded-lg bg-cove-sidebar text-cove-sidebar-text shadow-lg md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Nav panel */}
      <nav
        ref={navRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          native-safe-panel flex flex-col h-full bg-cove-sidebar text-cove-sidebar-text transition-all duration-300 ease-out overflow-hidden shrink-0
          fixed top-0 left-0 z-50 md:relative md:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: expanded ? NAV_WIDTH : RAIL_WIDTH }}
        aria-label="Main navigation"
      >
        {/* Logo + pin */}
        <div className="flex items-center justify-between px-3 py-4 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-cove-accent/20 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 512 512" fill="none">
                <polygon points="77,369 195,175 248,248 320,195 435,369" fill="currentColor" opacity="0.7" />
              </svg>
            </div>
            {expanded && (
              <span className="text-base font-semibold tracking-tight whitespace-nowrap">
                Cove
              </span>
            )}
          </div>
          {expanded && (
            <button
              onClick={togglePin}
              aria-label={pinned ? "Collapse navigation" : "Pin navigation"}
              className="hidden md:flex p-1.5 rounded-md text-cove-sidebar-text/40 hover:text-cove-sidebar-text hover:bg-white/10 transition-colors"
              title={pinned ? "Collapse" : "Pin open"}
            >
              {pinned ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* User greeting */}
        {expanded && userName && (
          <div className="px-4 pb-3">
            <p className="text-xs text-cove-sidebar-text/50 truncate">
              Welcome, {userName}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="mx-3 border-t border-cove-sidebar-text/10 mb-2" />

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {items.map((item) => {
            const isActive = item.id === activeItem;
            const isAlwaysOn = item.id === "daily-view";
            const isEnabled = !showToggles || isAlwaysOn || moduleStates[item.id] !== false;

            return (
              <div key={item.id} className="group relative">
                <button
                  id={`nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                    ${isActive
                      ? "bg-white/15 text-cove-sidebar-text font-medium"
                      : isEnabled
                      ? "text-cove-sidebar-text/70 hover:bg-white/8 hover:text-cove-sidebar-text"
                      : "text-cove-sidebar-text/30 hover:bg-white/5"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {expanded && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {showToggles && !isAlwaysOn && (
                        <span
                          role="switch"
                          aria-checked={isEnabled}
                          aria-label={`Toggle ${item.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModule(item.id, !isEnabled);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              onToggleModule(item.id, !isEnabled);
                            }
                          }}
                          tabIndex={0}
                          className={`
                            relative inline-flex items-center rounded-full cursor-pointer transition-colors shrink-0
                            opacity-0 group-hover:opacity-100 focus:opacity-100
                            ${isEnabled ? "bg-cove-accent" : "bg-cove-sidebar-text/20"}
                          `}
                          style={{ width: 32, height: 18 }}
                        >
                          <span
                            className="inline-block rounded-full bg-white shadow transition-transform"
                            style={{
                              width: 14,
                              height: 14,
                              transform: isEnabled ? "translateX(16px)" : "translateX(2px)",
                            }}
                          />
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Tooltip when collapsed */}
                {!expanded && (
                  <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md bg-cove-charcoal text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="mx-3 border-t border-cove-sidebar-text/10 mt-2" />
        <div className="px-2 py-3 shrink-0">
          <button
            id="nav-settings"
            onClick={() => handleItemClick("settings")}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
              ${activeItem === "settings"
                ? "bg-white/15 text-cove-sidebar-text font-medium"
                : "text-cove-sidebar-text/70 hover:bg-white/8 hover:text-cove-sidebar-text"
              }
            `}
          >
            <span className="w-5 h-5 shrink-0 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </span>
            {expanded && <span className="flex-1 text-left">Settings</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
