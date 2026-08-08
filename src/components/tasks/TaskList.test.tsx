import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskList from "./TaskList";

const mockTasks = [
  { id: "1", title: "Buy groceries", completed: false, status: "active", stage: "today", priority: "medium", sortOrder: 0 },
  { id: "2", title: "Walk the dog", completed: true, status: "completed", stage: "today", priority: "medium", sortOrder: 1 },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("TaskList", () => {
  it("shows loading state initially", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    const { container } = render(<TaskList />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders tasks after fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    } as Response);

    render(<TaskList />);
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("adds a new task via TaskInput", async () => {
    const createdTask = {
      id: "3",
      title: "New task",
      completed: false,
      status: "active",
      stage: "today",
      priority: "medium",
      sortOrder: 0,
    };
    let tasks: typeof mockTasks = [];
    vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      if (String(input) === "/api/tasks" && init?.method === "POST") {
        tasks = [createdTask];
        return { ok: true, json: async () => createdTask } as Response;
      }
      return { ok: true, json: async () => tasks } as Response;
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Add a task...");
    await userEvent.type(input, "today: New task{Enter}");

    await waitFor(() => {
      expect(screen.getByText("New task")).toBeInTheDocument();
    });
  });
});
