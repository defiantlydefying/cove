import { render, screen, waitFor } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DailyView from "./DailyView";

const mockDailyData = {
  tasks: [
    { id: "t1", title: "Buy groceries", completed: false, priority: "high" },
    { id: "t2", title: "Read chapter 5", completed: false, priority: "medium" },
  ],
  routines: [
    {
      id: "r1",
      name: "Morning Routine",
      steps: [
        { id: "s1", title: "Stretch" },
        { id: "s2", title: "Meditate" },
      ],
      logs: [{ id: "l1", completedSteps: ["s1"] }],
    },
  ],
  wellness: null,
  reminders: [
    { id: "rem1", title: "Drink water", message: null, type: "hydration" },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("DailyView", () => {
  it("shows loading state initially", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    const { container } = render(<DailyView />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders task section with tasks", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockDailyData,
    } as Response);

    render(<DailyView />);
    await waitFor(() => {
      expect(screen.getByText("Tasks")).toBeInTheDocument();
    });
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Read chapter 5")).toBeInTheDocument();
  });

  it("renders routine section with routines", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockDailyData,
    } as Response);

    render(<DailyView />);
    await waitFor(() => {
      expect(screen.getByText("Routines")).toBeInTheDocument();
    });
    expect(screen.getByText("Morning Routine")).toBeInTheDocument();
    expect(screen.getByText("Stretch")).toBeInTheDocument();
    expect(screen.getByText("Meditate")).toBeInTheDocument();
  });

  it("shows wellness check-in prompt when no check-in exists", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockDailyData,
    } as Response);

    render(<DailyView />);
    await waitFor(() => {
      expect(screen.getByText("How are you feeling?")).toBeInTheDocument();
    });
    // CheckinForm should be rendered since wellness is null
    expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
  });

  it("handles empty state gracefully", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [],
        routines: [],
        wellness: null,
        reminders: [],
      }),
    } as Response);

    render(<DailyView />);
    await waitFor(() => {
      expect(
        screen.getByText("A clean slate")
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Tasks")).not.toBeInTheDocument();
    expect(screen.queryByText("Routines")).not.toBeInTheDocument();
    expect(screen.queryByText("Reminders")).not.toBeInTheDocument();
  });
});
