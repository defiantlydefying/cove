"use client";

import { useEffect, useMemo, useState } from "react";
import { tapLight } from "@/lib/capacitor/haptics";

interface NavItem {
  id: string;
  label: string;
}

interface NativeTabBarProps {
  items: NavItem[];
  activeItem: string;
  onItemChange: (id: string) => void;
  moduleStates?: Record<string, boolean>;
}

const PRIMARY_ITEMS = [
  { id: "daily-view", label: "Today" },
  { id: "tasks", label: "Tasks" },
  { id: "companion", label: "Companion" },
  { id: "productivity", label: "Plan" },
];

const PRIMARY_IDS = new Set(PRIMARY_ITEMS.map((item) => item.id));

function NativeNavIcon({ id }: { id: string }) {
  const common = {
    width: 23,
    height: 23,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (id === "daily-view") {
    return (
      <svg {...common}>
        <path d="M4 6.5h16v13H4z" />
        <path d="M8 3.5v5M16 3.5v5M4 10h16" />
        <path d="m8 15 2 2 5-5" />
      </svg>
    );
  }

  if (id === "tasks") {
    return (
      <svg {...common}>
        <circle cx="6" cy="7" r="1.5" />
        <circle cx="6" cy="12" r="1.5" />
        <circle cx="6" cy="17" r="1.5" />
        <path d="M10 7h8M10 12h8M10 17h8" />
      </svg>
    );
  }

  if (id === "companion") {
    return (
      <svg {...common}>
        <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
        <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
      </svg>
    );
  }

  if (id === "productivity") {
    return (
      <svg {...common}>
        <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
        <path d="M8 2.5v4M16 2.5v4M3.5 9h17" />
        <path d="M8 13h3M8 17h7" />
      </svg>
    );
  }

  if (id === "routines") {
    return (
      <svg {...common}>
        <path d="M4 7h10M4 12h16M4 17h10" />
        <path d="m16 5 2 2-2 2M16 15l2 2-2 2" />
      </svg>
    );
  }

  if (id === "focus-habits") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 1.5v3M22.5 12h-3M12 22.5v-3M1.5 12h3" />
      </svg>
    );
  }

  if (id === "wellness") {
    return (
      <svg {...common}>
        <path d="M20 8.5c0 5-8 10.5-8 10.5S4 13.5 4 8.5a4.2 4.2 0 0 1 7.2-3L12 6.3l.8-.8A4.2 4.2 0 0 1 20 8.5Z" />
      </svg>
    );
  }

  if (id === "reminders") {
    return (
      <svg {...common}>
        <path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9Z" />
        <path d="M10 20h4" />
      </svg>
    );
  }

  if (id === "gamification") {
    return (
      <svg {...common}>
        <path d="M5 19V9M12 19V5M19 19v-7" />
        <path d="m3 7 5-4 4 3 7-4" />
      </svg>
    );
  }

  if (id === "community") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 15a4.5 4.5 0 0 1 6.5 4" />
      </svg>
    );
  }

  if (id === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function NativeTabBar({
  items,
  activeItem,
  onItemChange,
  moduleStates,
}: NativeTabBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const moreItems = useMemo(
    () => [
      ...items.filter(
        (item) =>
          !PRIMARY_IDS.has(item.id) && moduleStates?.[item.id] !== false
      ),
      { id: "settings", label: "Settings" },
    ],
    [items, moduleStates]
  );

  const moreIsActive =
    activeItem === "settings" || moreItems.some((item) => item.id === activeItem);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);

  const selectItem = (id: string) => {
    void tapLight();
    onItemChange(id);
    setMoreOpen(false);
  };

  return (
    <>
      {moreOpen && (
        <>
          <button
            type="button"
            className="native-more-backdrop"
            aria-label="Close more navigation"
            onClick={() => setMoreOpen(false)}
          />
          <section
            className="native-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="native-more-title"
          >
            <div className="native-sheet-handle" aria-hidden="true" />
            <div className="native-more-heading">
              <div>
                <p className="native-overline">Cove</p>
                <h2 id="native-more-title">More</h2>
              </div>
              <button
                type="button"
                className="native-circle-button"
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="native-more-grid">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`native-more-item ${
                    activeItem === item.id ? "is-active" : ""
                  }`}
                  onClick={() => selectItem(item.id)}
                >
                  <span className="native-more-icon">
                    <NativeNavIcon id={item.id} />
                  </span>
                  <span>{item.label}</span>
                  <svg className="native-more-chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <nav className="native-tab-bar" aria-label="App navigation">
        {PRIMARY_ITEMS.map((item) => {
          const active = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`native-tab-item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => selectItem(item.id)}
            >
              <span className="native-tab-icon">
                <NativeNavIcon id={item.id} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={`native-tab-item ${moreIsActive ? "is-active" : ""}`}
          aria-expanded={moreOpen}
          onClick={() => {
            void tapLight();
            setMoreOpen(true);
          }}
        >
          <span className="native-tab-icon">
            <NativeNavIcon id="more" />
          </span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
