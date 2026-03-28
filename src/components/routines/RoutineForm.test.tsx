import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RoutineForm from "./RoutineForm";

describe("RoutineForm", () => {
  it("renders name input", () => {
    render(<RoutineForm onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("Name your routine...")).toBeInTheDocument();
  });

  it("can add step inputs", async () => {
    render(<RoutineForm onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("Step 1")).toBeInTheDocument();
    await userEvent.click(screen.getByText("+ Add a step"));
    expect(screen.getByPlaceholderText("Step 2")).toBeInTheDocument();
  });

  it("calls onSubmit with routine data including timing fields", async () => {
    const onSubmit = vi.fn();
    render(<RoutineForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText("Name your routine..."), "Evening wind-down");
    await userEvent.type(screen.getByPlaceholderText("Step 1"), "Read a book");
    await userEvent.click(screen.getByText("+ Add a step"));
    await userEvent.type(screen.getByPlaceholderText("Step 2"), "Brush teeth");
    await userEvent.click(screen.getByText("Create routine"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Evening wind-down",
        steps: [
          { title: "Read a book", durationMinutes: null },
          { title: "Brush teeth", durationMinutes: null },
        ],
        showTimes: false,
        showDurations: true,
      })
    );
  });

  it("shows Save changes button when editing", () => {
    render(
      <RoutineForm
        onSubmit={vi.fn()}
        initialData={{
          name: "Existing",
          steps: [{ title: "Step A", durationMinutes: null }],
          startTime: null,
          showTimes: false,
          showDurations: true,
        }}
      />
    );
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });
});
