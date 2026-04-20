"use client";

import { useState } from "react";
import TaskPipeline from "./TaskPipeline";

const TABS = [
  { id: "inbox", label: "Inbox" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "someday", label: "Someday" },
  { id: "done", label: "Done" },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Pipeline tabs */}
      <div className="flex gap-1 bg-cove-offwhite rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-cove-card text-cove-accent shadow-sm"
                : "text-cove-muted hover:text-cove-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline content */}
      <TaskPipeline stage={activeTab} />
    </div>
  );
}
