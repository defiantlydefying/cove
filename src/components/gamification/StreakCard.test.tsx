import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import StreakCard, { Streak } from "./StreakCard";

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    id: "streak-1",
    userId: "user-1",
    type: "tasks",
    currentStreak: 5,
    longestStreak: 12,
    lastActiveAt: new Date().toISOString(),
    pausedAt: null,
    totalXp: 50,
    ...overrides,
  };
}

describe("StreakCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders streak type and count", () => {
    render(<StreakCard streak={makeStreak({ type: "tasks", currentStreak: 5 })} />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 'Paused' when streak is paused (lastActiveAt before yesterday)", () => {
    const threeDaysAgo = new Date("2026-03-22T10:00:00Z").toISOString();
    render(
      <StreakCard streak={makeStreak({ lastActiveAt: threeDaysAgo })} />,
    );
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("does not show 'Paused' when lastActiveAt is today", () => {
    const today = new Date("2026-03-25T08:00:00Z").toISOString();
    render(<StreakCard streak={makeStreak({ lastActiveAt: today })} />);
    expect(screen.queryByText("Paused")).not.toBeInTheDocument();
  });

  it("does not show 'Paused' when lastActiveAt is yesterday", () => {
    const yesterday = new Date("2026-03-24T20:00:00Z").toISOString();
    render(<StreakCard streak={makeStreak({ lastActiveAt: yesterday })} />);
    expect(screen.queryByText("Paused")).not.toBeInTheDocument();
  });

  it("shows longest streak", () => {
    render(<StreakCard streak={makeStreak({ longestStreak: 12 })} />);
    expect(screen.getByText("Best: 12d")).toBeInTheDocument();
  });

  it("shows total XP", () => {
    render(<StreakCard streak={makeStreak({ totalXp: 50 })} />);
    expect(screen.getByText("50 XP")).toBeInTheDocument();
  });
});
