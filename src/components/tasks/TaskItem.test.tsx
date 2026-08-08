import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskItem, { Task } from "./TaskItem";

const baseTask: Task = {
  id: "1",
  title: "Buy groceries",
  completed: false,
  status: "active",
  stage: "today",
  priority: "medium",
  sortOrder: 0,
};

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onUpdate: vi.fn(),
  onAddSubTasks: vi.fn(),
};

describe("TaskItem", () => {
  it("renders task title", () => {
    render(<TaskItem task={baseTask} {...defaultProps} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("shows checkbox checked when completed", () => {
    const task = { ...baseTask, completed: true, status: "completed" };
    render(<TaskItem task={task} {...defaultProps} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onToggle when checkbox clicked", async () => {
    const onToggle = vi.fn();
    render(<TaskItem task={baseTask} {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(<TaskItem task={baseTask} {...defaultProps} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText("Delete Buy groceries"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("shows a formatted deadline", () => {
    const task = { ...baseTask, deadline: "2999-04-01T12:00:00" };
    render(<TaskItem task={task} {...defaultProps} />);
    expect(screen.getByText(/Due Apr 1/)).toBeInTheDocument();
  });

  it("shows the normalized energy label", () => {
    const task: Task = { ...baseTask, energyLevel: "low energy" };
    render(<TaskItem task={task} {...defaultProps} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("applies line-through styling when completed", () => {
    const task = { ...baseTask, completed: true, status: "completed" };
    render(<TaskItem task={task} {...defaultProps} />);
    expect(screen.getByText("Buy groceries")).toHaveClass("line-through");
  });
});
