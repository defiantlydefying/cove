import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NativeStartScreen from "./NativeStartScreen";

vi.mock("@/lib/capacitor/haptics", () => ({
  tapLight: vi.fn().mockResolvedValue(undefined),
}));

describe("NativeStartScreen", () => {
  it("offers focused account actions without marketing navigation", () => {
    render(<NativeStartScreen />);

    expect(
      screen.getByRole("heading", { name: "Start where you are." })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create my Cove" })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(
      screen.getByRole("link", { name: "I already have an account" })
    ).toHaveAttribute("href", "/login");
  });
});
