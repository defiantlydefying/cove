import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ReminderItem, { Reminder } from "./ReminderItem";

const baseReminder: Reminder = {
  id: "r1",
  title: "Drink water",
  message: null,
  type: "hydration",
  schedule: null,
  enabled: true,
  snoozedUntil: null,
};

const noop = vi.fn();

describe("ReminderItem", () => {
  it("renders title", () => {
    render(
      <ReminderItem
        reminder={baseReminder}
        onToggle={noop}
        onDelete={noop}
        onSnooze={noop}
      />
    );
    expect(screen.getByText("Drink water")).toBeInTheDocument();
  });

  it("shows type badge", () => {
    render(
      <ReminderItem
        reminder={baseReminder}
        onToggle={noop}
        onDelete={noop}
        onSnooze={noop}
      />
    );
    expect(screen.getByTestId("type-badge")).toHaveTextContent("hydration");
  });

  it("calls onToggle when switch clicked", async () => {
    const onToggle = vi.fn();
    render(
      <ReminderItem
        reminder={baseReminder}
        onToggle={onToggle}
        onDelete={noop}
        onSnooze={noop}
      />
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith("r1", false);
  });

  it("calls onDelete when delete clicked", async () => {
    const onDelete = vi.fn();
    render(
      <ReminderItem
        reminder={baseReminder}
        onToggle={noop}
        onDelete={onDelete}
        onSnooze={noop}
      />
    );
    await userEvent.click(screen.getByLabelText("Delete Drink water"));
    expect(onDelete).toHaveBeenCalledWith("r1");
  });

  it("shows snooze status when snoozed", () => {
    const future = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const snoozed: Reminder = { ...baseReminder, snoozedUntil: future };
    render(
      <ReminderItem
        reminder={snoozed}
        onToggle={noop}
        onDelete={noop}
        onSnooze={noop}
      />
    );
    expect(screen.getByText(/Snoozed until/)).toBeInTheDocument();
  });
});
