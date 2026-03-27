import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskList from "./TaskList";

const mockTasks = [
  { id: "1", title: "Buy groceries", completed: false },
  { id: "2", title: "Walk the dog", completed: true },
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
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "3", title: "New task", completed: false }),
      } as Response);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Add a task...");
    await userEvent.type(input, "New task{Enter}");

    await waitFor(() => {
      expect(screen.getByText("New task")).toBeInTheDocument();
    });
  });
});
