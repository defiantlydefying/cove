import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskInput from "./TaskInput";

describe("TaskInput", () => {
  it("renders input with placeholder", () => {
    render(<TaskInput onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("Add a task...")).toBeInTheDocument();
  });

  it("calls onAdd on Enter with input value", async () => {
    const onAdd = vi.fn();
    render(<TaskInput onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("Add a task...");
    await userEvent.type(input, "New task{Enter}");
    expect(onAdd).toHaveBeenCalledWith("New task");
  });

  it("clears input after submit", async () => {
    render(<TaskInput onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText("Add a task...") as HTMLInputElement;
    await userEvent.type(input, "New task{Enter}");
    expect(input.value).toBe("");
  });

  it("does not call onAdd if input is empty", async () => {
    const onAdd = vi.fn();
    render(<TaskInput onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("Add a task...");
    await userEvent.type(input, "{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });
});
