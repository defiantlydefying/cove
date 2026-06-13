"use client";

import { useState } from "react";
import CommunityBrowser from "./CommunityBrowser";
import VentFeed from "./VentFeed";
import IdentityPanel from "./IdentityPanel";

type Tab = "routines" | "vents";

export default function CommunityTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("routines");

  return (
    <div className="flex flex-col gap-4">
      {/* Identity panel */}
      <IdentityPanel />

      {/* Header with tabs and messages */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-cove-offwhite rounded-xl p-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "routines"}
            onClick={() => setActiveTab("routines")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "routines"
                ? "bg-white text-cove-charcoal shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Routines
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "vents"}
            onClick={() => setActiveTab("vents")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "vents"
                ? "bg-white text-cove-charcoal shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            Vents
          </button>
        </div>

        {/* Messages button — prominent */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-cove-accent bg-cove-accent/10 hover:bg-cove-accent/20 rounded-xl transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Messages
        </button>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in-up">
        {activeTab === "routines" && <CommunityBrowser />}
        {activeTab === "vents" && <VentFeed />}
      </div>
    </div>
  );
}
