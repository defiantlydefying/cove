"use client";

import { ReactNode } from "react";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Sidebar({ visible, onClose, children }: SidebarProps) {
  return (
    <aside
      className={`border-l border-cove-border-light bg-cove-sidebar transition-all duration-300 ${
        visible
          ? "w-80 opacity-100"
          : "w-0 opacity-0 overflow-hidden pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-end p-2">
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="p-1 rounded-md text-cove-muted hover:text-cove-charcoal hover:bg-cove-sand-light transition-colors"
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
      <div className="p-4">{children}</div>
    </aside>
  );
}
