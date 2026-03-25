import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TabBar from "./TabBar";

const tabs = [
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
  { id: "review", label: "Review" },
];

describe("TabBar", () => {
  it("renders all tabs", () => {
    render(<TabBar tabs={tabs} activeTab="plan" onTabChange={vi.fn()} />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", () => {
    render(<TabBar tabs={tabs} activeTab="build" onTabChange={vi.fn()} />);
    expect(screen.getByText("Build")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Plan")).toHaveAttribute("aria-selected", "false");
  });

  it("calls onTabChange on click", async () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="plan" onTabChange={onTabChange} />);
    await userEvent.click(screen.getByText("Build"));
    expect(onTabChange).toHaveBeenCalledWith("build");
  });

  it("uses tablist role", () => {
    render(<TabBar tabs={tabs} activeTab="plan" onTabChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("supports keyboard navigation (ArrowRight)", async () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="plan" onTabChange={onTabChange} />);
    const firstTab = screen.getByText("Plan");
    firstTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onTabChange).toHaveBeenCalledWith("build");
  });
});
