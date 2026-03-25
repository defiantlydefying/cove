import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskItem, { Task } from "./TaskItem";

const baseTask: Task = {
  id: "1",
  title: "Buy groceries",
  completed: false,
};

describe("TaskItem", () => {
  it("renders task title", () => {
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("shows checkbox checked when completed", () => {
    const task = { ...baseTask, completed: true };
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("calls onToggle when checkbox clicked", async () => {
    const onToggle = vi.fn();
    render(<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText("Delete Buy groceries"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("shows deadline when present", () => {
    const task = { ...baseTask, deadline: "2026-04-01" };
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("2026-04-01")).toBeInTheDocument();
  });

  it("shows energy level badge when present", () => {
    const task: Task = { ...baseTask, energyLevel: "low energy" };
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("low energy")).toBeInTheDocument();
  });

  it("applies line-through styling when completed", () => {
    const task = { ...baseTask, completed: true };
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const title = screen.getByText("Buy groceries");
    expect(title.className).toContain("line-through");
  });
});
