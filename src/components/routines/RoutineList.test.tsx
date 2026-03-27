import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RoutineList from "./RoutineList";

const mockRoutines = [
  {
    id: "r1",
    name: "Morning routine",
    steps: [
      { id: "s1", title: "Stretch" },
      { id: "s2", title: "Meditate" },
    ],
    active: true,
  },
  {
    id: "r2",
    name: "Evening routine",
    steps: [{ id: "s3", title: "Read" }],
    active: true,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("RoutineList", () => {
  it("shows loading state", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {})
    );
    render(<RoutineList />);
    expect(screen.getByText("Loading routines...")).toBeInTheDocument();
  });

  it("renders routines after fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => mockRoutines,
    } as Response);

    render(<RoutineList />);
    await waitFor(() => {
      expect(screen.getByText("Morning routine")).toBeInTheDocument();
    });
    expect(screen.getByText("Evening routine")).toBeInTheDocument();
  });

  it("shows new routine form when button clicked", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => [],
    } as Response);

    render(<RoutineList />);
    await waitFor(() => {
      expect(screen.queryByText("Loading routines...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("+ New routine"));
    expect(screen.getByPlaceholderText("Name your routine...")).toBeInTheDocument();
  });

  it("renders template cards", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => [],
    } as Response);

    render(<RoutineList />);
    await waitFor(() => {
      expect(screen.queryByText("Loading routines...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Morning Routine")).toBeInTheDocument();
    expect(screen.getByText("Wind-Down")).toBeInTheDocument();
    expect(screen.getByText("Work Focus")).toBeInTheDocument();
    expect(screen.getByText("Self-Care")).toBeInTheDocument();
  });

  it("shows AI prompt input", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => [],
    } as Response);

    render(<RoutineList />);
    await waitFor(() => {
      expect(screen.queryByText("Loading routines...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("ai-prompt-input")).toBeInTheDocument();
    expect(screen.getByTestId("ai-generate-btn")).toBeInTheDocument();
  });
});
