import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import StreakCard, { ModuleStreak } from "./StreakCard";

function makeStreak(overrides: Partial<ModuleStreak> = {}): ModuleStreak {
  return {
    type: "tasks",
    current: 5,
    longest: 12,
    week: [true, true, true, true, true, false, false],
    totalXp: 50,
    ...overrides,
  };
}

describe("StreakCard", () => {
  beforeEach(() => {
    // Wednesday (index 2 in Mon-Sun)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders streak type and count", () => {
    render(<StreakCard streak={makeStreak({ type: "tasks", current: 5 })} />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders different module types with their labels", () => {
    render(<StreakCard streak={makeStreak({ type: "focus" })} />);
    expect(screen.getByText("Focus")).toBeInTheDocument();
  });

  it("shows 'Active today' badge when today's slot in week is active", () => {
    // Wednesday = index 2; set true there
    const week = [false, false, true, false, false, false, false];
    render(<StreakCard streak={makeStreak({ week })} />);
    expect(screen.getByText("Active today")).toBeInTheDocument();
  });

  it("does not show 'Active today' when today is not active", () => {
    const week = [true, true, false, false, false, false, false];
    render(<StreakCard streak={makeStreak({ week })} />);
    expect(screen.queryByText("Active today")).not.toBeInTheDocument();
  });

  it("shows longest streak", () => {
    render(<StreakCard streak={makeStreak({ longest: 12 })} />);
    expect(screen.getByText("Best: 12d")).toBeInTheDocument();
  });

  it("shows total XP", () => {
    render(<StreakCard streak={makeStreak({ totalXp: 50 })} />);
    expect(screen.getByText("50 XP")).toBeInTheDocument();
  });
});
