import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReminderList from "./ReminderList";

const mockReminders = [
  {
    id: "r1",
    title: "Drink water",
    message: null,
    type: "hydration",
    schedule: null,
    enabled: true,
    snoozedUntil: null,
  },
  {
    id: "r2",
    title: "Stretch break",
    message: "Stand up and stretch",
    type: "break",
    schedule: null,
    enabled: false,
    snoozedUntil: null,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ReminderList", () => {
  it("shows loading state", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    const { container } = render(<ReminderList />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders reminders after fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockReminders,
    } as Response);

    render(<ReminderList />);
    await waitFor(() => {
      expect(screen.getByText("Drink water")).toBeInTheDocument();
    });
    expect(screen.getByText("Stretch break")).toBeInTheDocument();
  });

  it("shows form when button clicked", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const { container } = render(<ReminderList />);

    await waitFor(() => {
      expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("+ Custom reminder"));
    expect(screen.getByLabelText("Reminder title")).toBeInTheDocument();
  });
});
