import { act, render, screen, waitFor } from "@/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ProductivityPanel from "./ProductivityPanel";

const plannerItems = [
  {
    id: "p1",
    title: "Write report",
    date: new Date().toISOString().split("T")[0],
    zone: "must",
    sortOrder: 0,
    startTime: null,
    endTime: null,
    completed: false,
    taskId: null,
  },
];

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((input: string | URL | Request) => {
    const url = String(input);
    if (url === "/api/productivity") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          focusSessions: [],
          weekSessions: [],
          plannerItems,
          habits: [],
          weeklyGoals: [],
          timeEntries: [],
        }),
      });
    }
    if (url.startsWith("/api/productivity/planner?")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(plannerItems) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

afterEach(() => vi.restoreAllMocks());

describe("ProductivityPanel", () => {
  test("renders loading state then the planner", async () => {
    render(<ProductivityPanel />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Planner")).toBeInTheDocument());
    expect(screen.getAllByText("Write report").length).toBeGreaterThan(0);
  });

  test("renders week navigation controls", async () => {
    render(<ProductivityPanel />);

    await waitFor(() => expect(screen.getByLabelText("Previous week")).toBeInTheDocument());
    expect(screen.getByLabelText("Next week")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  test("renders error state with retry", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(<ProductivityPanel />);

    await waitFor(() => expect(screen.getByText("Failed to load planner data")).toBeInTheDocument());
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  test("toggles between week and list views", async () => {
    render(<ProductivityPanel />);
    await waitFor(() => expect(screen.getByText("Week")).toBeInTheDocument());

    await act(async () => screen.getByText("List").click());
    expect(screen.getByText("Write report")).toBeInTheDocument();
  });
});
