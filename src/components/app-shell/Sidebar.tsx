"use client";

import { ReactNode, useEffect } from "react";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Sidebar({ visible, onClose, children }: SidebarProps) {
  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {visible && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          border-l border-cove-sidebar/20 bg-cove-sidebar text-cove-sidebar-text transition-all duration-300
          fixed top-0 right-0 h-full z-50 md:relative md:z-auto
          ${
            visible
              ? "w-80 opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-full md:translate-x-0 overflow-hidden pointer-events-none"
          }
        `}
      >
        <div className="flex items-center justify-end p-2">
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-2 rounded-md text-cove-sidebar-text/60 hover:text-cove-sidebar-text hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-48px)]">{children}</div>
      </aside>
    </>
  );
}
