import { render, screen, waitFor, act } from "@/test-utils";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import ProductivityPanel from "./ProductivityPanel";

const mockData = {
  focusSessions: [
    { id: "s1", label: "Coding", taskId: null, durationMin: 25, sessionType: "focus", completedAt: new Date().toISOString() },
  ],
  weekSessions: [
    { id: "s1", label: "Coding", taskId: null, durationMin: 25, sessionType: "focus", completedAt: new Date().toISOString() },
  ],
  plannerItems: [
    { id: "p1", title: "Write report", date: new Date().toISOString().split("T")[0], zone: "must", sortOrder: 0, startTime: null, endTime: null, completed: false, taskId: null },
  ],
  habits: [
    { id: "h1", title: "Read", currentStreak: 3, longestStreak: 5, checks: [] },
  ],
  weeklyGoals: [
    { id: "g1", title: "Exercise 3x", targetCount: 3, currentCount: 1, weekStart: "2026-03-23", linkedHabitId: null },
  ],
  timeEntries: [],
};

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/productivity") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProductivityPanel", () => {
  test("renders loading state then content", async () => {
    render(<ProductivityPanel />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Daily Planner")).toBeInTheDocument();
    });

    expect(screen.getByText("Write report")).toBeInTheDocument();
    expect(screen.getByText("Exercise 3x")).toBeInTheDocument();
  });

  test("renders focus timer controls", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(screen.getByText("Start")).toBeInTheDocument();
    });

    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("Short Break")).toBeInTheDocument();
    expect(screen.getByText("Long Break")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Working on...")).toBeInTheDocument();
  });

  test("renders error state with retry", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load productivity data")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  test("toggles planner view mode", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(screen.getByText("Zones")).toBeInTheDocument();
    });

    const listBtn = screen.getByText("List");
    await act(async () => {
      listBtn.click();
    });

    expect(screen.getByText("Write report")).toBeInTheDocument();
  });

  test("shows habit streak", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(screen.getByText("3d")).toBeInTheDocument();
    });
  });

  test("shows goal progress", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });
  });

  test("shows time summary", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => {
      expect(screen.getByText("Today")).toBeInTheDocument();
    });

    expect(screen.getByText("1 focus session")).toBeInTheDocument();
  });
});
