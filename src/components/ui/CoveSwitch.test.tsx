import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CoveSwitch from "./CoveSwitch";

describe("CoveSwitch", () => {
  it("exposes its state and toggles cleanly", async () => {
    const onCheckedChange = vi.fn();
    render(
      <CoveSwitch
        checked
        onCheckedChange={onCheckedChange}
        label="Enable reminders"
      />
    );

    const control = screen.getByRole("switch", { name: "Enable reminders" });
    expect(control).toHaveAttribute("aria-checked", "true");

    await userEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});
