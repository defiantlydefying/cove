import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CheckinForm from "./CheckinForm";

describe("CheckinForm", () => {
  it("renders mood, energy, and sleep rows", () => {
    render(<CheckinForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Mood")).toBeInTheDocument();
    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
  });

  it("renders all five level buttons for each row", () => {
    render(<CheckinForm onSubmit={vi.fn()} />);
    const roughButtons = screen.getAllByText("Rough");
    expect(roughButtons).toHaveLength(3);
    const greatButtons = screen.getAllByText("Great");
    expect(greatButtons).toHaveLength(3);
  });

  it("calls onSubmit with selected values", async () => {
    const onSubmit = vi.fn();
    render(<CheckinForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText("Mood Good"));
    await userEvent.click(screen.getByLabelText("Energy Okay"));
    await userEvent.click(screen.getByLabelText("Sleep Great"));
    await userEvent.click(screen.getByText("Save check-in"));

    expect(onSubmit).toHaveBeenCalledWith({
      mood: 4,
      energy: 3,
      sleep: 5,
      notes: null,
    });
  });

  it("pre-fills when existingCheckin is provided", () => {
    render(
      <CheckinForm
        existingCheckin={{ mood: 3, energy: 2, sleep: 4, notes: "Tired" }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Mood Okay")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByLabelText("Energy Low")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByLabelText("Sleep Good")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByPlaceholderText("How are you feeling today?")).toHaveValue(
      "Tired"
    );
  });

  it("submits with notes when provided", async () => {
    const onSubmit = vi.fn();
    render(<CheckinForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText("Mood Great"));
    await userEvent.type(
      screen.getByPlaceholderText("How are you feeling today?"),
      "Feeling awesome"
    );
    await userEvent.click(screen.getByText("Save check-in"));

    expect(onSubmit).toHaveBeenCalledWith({
      mood: 5,
      energy: null,
      sleep: null,
      notes: "Feeling awesome",
    });
  });
});
