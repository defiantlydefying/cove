import { render, screen, waitFor } from "@/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
      steps: [{ id: "s1", title: "Stretch" }, { id: "s2", title: "Meditate" }],
      logs: [{ id: "l1", completedSteps: ["s1"] }],
    },
  ],
  wellness: null,
  reminders: [{ id: "rem1", title: "Drink water", message: null, type: "hydration" }],
};

function mockDailyRequests(dailyData = mockDailyData) {
  vi.spyOn(global, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    const payload =
      url === "/api/daily" ? dailyData :
      url === "/api/gamification" ? null :
      url === "/api/wellness?days=7" ? [] :
      url === "/api/companion/greeting" ? { greeting: "One thing at a time.", companionType: "fox" } :
      url === "/api/settings" ? { companionType: "fox" } :
      url === "/api/auth/session" ? { user: { name: "Emma" } } : {};

    return { ok: true, json: async () => payload } as Response;
  });
}

beforeEach(() => vi.restoreAllMocks());

describe("DailyView", () => {
  it("shows loading state initially", () => {
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    const { container } = render(<DailyView />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders tasks and routines from the daily response", async () => {
    mockDailyRequests();
    render(<DailyView />);

    await waitFor(() => expect(screen.getByText("Buy groceries")).toBeInTheDocument());
    expect(screen.getByText("Read chapter 5")).toBeInTheDocument();
    expect(screen.getByText("Morning Routine")).toBeInTheDocument();
  });

  it("shows the wellness check-in when no check-in exists", async () => {
    mockDailyRequests();
    render(<DailyView />);

    await waitFor(() => expect(screen.getByText("Daily Check-in")).toBeInTheDocument());
    expect(screen.getByPlaceholderText("How are you feeling today?")).toBeInTheDocument();
  });

  it("handles an empty day gracefully", async () => {
    mockDailyRequests({ tasks: [], routines: [], wellness: null, reminders: [] });
    render(<DailyView />);

    await waitFor(() => expect(screen.getByText("No tasks for today. Enjoy the quiet.")).toBeInTheDocument());
    expect(screen.queryByText("Routines")).not.toBeInTheDocument();
    expect(screen.queryByText("Upcoming")).not.toBeInTheDocument();
  });
});
