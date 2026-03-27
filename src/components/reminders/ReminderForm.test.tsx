import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ReminderForm from "./ReminderForm";

describe("ReminderForm", () => {
  it("renders title input and type selector", () => {
    render(<ReminderForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Reminder title")).toBeInTheDocument();
    expect(screen.getByLabelText("Reminder type")).toBeInTheDocument();
  });

  it("calls onSubmit with form data including schedule fields", async () => {
    const onSubmit = vi.fn();
    render(<ReminderForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Reminder title"), "Take meds");
    await userEvent.selectOptions(
      screen.getByLabelText("Reminder type"),
      "medication"
    );
    await userEvent.click(screen.getByRole("button", { name: "Add reminder" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Take meds",
        type: "medication",
        scheduledTime: "09:00",
        activeDays: "0,1,2,3,4,5,6",
        soundEnabled: true,
        notifyEnabled: true,
      })
    );
  });
});
