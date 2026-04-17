import { render, screen, waitFor } from "@/test-utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import GamificationPanel from "./GamificationPanel";

const emptyWeek = [false, false, false, false, false, false, false];

const mockData = {
  dailyStreak: {
    current: 3,
    longest: 10,
    lastActiveDate: "2026-04-10",
  },
  weekActivity: [
    { date: "2026-04-06", hit: true },
    { date: "2026-04-07", hit: true },
    { date: "2026-04-08", hit: true },
    { date: "2026-04-09", hit: false },
    { date: "2026-04-10", hit: true },
    { date: "2026-04-11", hit: false },
    { date: "2026-04-12", hit: false },
  ],
  weekStartDate: "2026-04-06",
  modules: {
    tasks: { current: 2, longest: 7, week: [...emptyWeek], totalXp: 20 },
    routines: { current: 0, longest: 5, week: [...emptyWeek], totalXp: 10 },
    wellness: { current: 1, longest: 3, week: [...emptyWeek], totalXp: 10 },
    focus: { current: 0, longest: 2, week: [...emptyWeek], totalXp: 5 },
    habits: { current: 0, longest: 0, week: [...emptyWeek], totalXp: 0 },
  },
  streaks: [],
  totalXp: 50,
  level: 1,
  xpInLevel: 50,
  xpToNextLevel: 100,
  stats: {
    tasksCompleted: 5,
    focusSessions: 2,
    habitChecks: 3,
    wellnessCheckins: 1,
  },
  achievements: [
    {
      id: "a1",
      key: "first_task",
      name: "First Task",
      description: "Complete your first task",
      xpReward: 25,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    },
  ],
};

describe("GamificationPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    const { container } = render(<GamificationPanel />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders daily streak section and level after fetch", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<GamificationPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Seedling/)).toBeInTheDocument();
    });

    // Daily streak section header present
    expect(screen.getByText("Daily Streak")).toBeInTheDocument();
    // Total XP appears somewhere
    expect(screen.getAllByText("50").length).toBeGreaterThan(0);
  });

  it("renders the weekly activity count", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<GamificationPanel />);

    await waitFor(() => {
      expect(screen.getByText("This week")).toBeInTheDocument();
    });

    // 4 active days out of 7
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders achievements", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<GamificationPanel />);

    await waitFor(() => {
      expect(screen.getByText("First Task")).toBeInTheDocument();
    });

    expect(screen.getByText("Complete your first task")).toBeInTheDocument();
  });
});
