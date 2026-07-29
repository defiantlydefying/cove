import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import NativeTabBar from "./NativeTabBar";

vi.mock("@/lib/capacitor/haptics", () => ({
  tapLight: vi.fn().mockResolvedValue(undefined),
}));

const items = [
  { id: "daily-view", label: "Daily View" },
  { id: "tasks", label: "Tasks" },
  { id: "companion", label: "Companion" },
  { id: "productivity", label: "Planner" },
  { id: "routines", label: "Routines" },
  { id: "wellness", label: "Wellness" },
];

describe("NativeTabBar", () => {
  it("shows the four primary destinations and More", () => {
    render(
      <NativeTabBar
        items={items}
        activeItem="daily-view"
        onItemChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Companion" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("navigates to a primary destination", async () => {
    const onItemChange = vi.fn();
    render(
      <NativeTabBar
        items={items}
        activeItem="daily-view"
        onItemChange={onItemChange}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(onItemChange).toHaveBeenCalledWith("tasks");
  });

  it("opens overflow destinations in a bottom sheet", async () => {
    const onItemChange = vi.fn();
    render(
      <NativeTabBar
        items={items}
        activeItem="daily-view"
        onItemChange={onItemChange}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("dialog", { name: "More" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Routines" }));
    expect(onItemChange).toHaveBeenCalledWith("routines");
  });
});
