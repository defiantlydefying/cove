import { render, screen, waitFor } from "@/test-utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import GamificationPanel from "./GamificationPanel";

const mockData = {
  streaks: [
    {
      id: "s1",
      userId: "u1",
      type: "daily",
      currentStreak: 3,
      longestStreak: 10,
      lastActiveAt: new Date().toISOString(),
      pausedAt: null,
      totalXp: 30,
    },
    {
      id: "s2",
      userId: "u1",
      type: "tasks",
      currentStreak: 2,
      longestStreak: 7,
      lastActiveAt: new Date().toISOString(),
      pausedAt: null,
      totalXp: 20,
    },
  ],
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

  it("renders total XP and level after fetch", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<GamificationPanel />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    expect(screen.getByText(/Seedling/)).toBeInTheDocument();
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

    expect(
      screen.getByText("Complete your first task"),
    ).toBeInTheDocument();
  });
});
