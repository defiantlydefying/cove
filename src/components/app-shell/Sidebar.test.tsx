import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  it("renders children when visible", () => {
    render(
      <Sidebar visible={true} onClose={vi.fn()}>
        <p>Sidebar content</p>
      </Sidebar>
    );
    expect(screen.getByText("Sidebar content")).toBeInTheDocument();
  });

  it("is hidden when visible is false", () => {
    const { container } = render(
      <Sidebar visible={false} onClose={vi.fn()}>
        <p>Sidebar content</p>
      </Sidebar>
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("w-0");
    expect(aside?.className).toContain("opacity-0");
    expect(aside?.className).toContain("pointer-events-none");
  });

  it("calls onClose when dismiss button clicked", async () => {
    const onClose = vi.fn();
    render(
      <Sidebar visible={true} onClose={onClose}>
        <p>Content</p>
      </Sidebar>
    );
    await userEvent.click(screen.getByLabelText("Close sidebar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has accessible close button", () => {
    render(
      <Sidebar visible={true} onClose={vi.fn()}>
        <p>Content</p>
      </Sidebar>
    );
    const button = screen.getByLabelText("Close sidebar");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });
});
