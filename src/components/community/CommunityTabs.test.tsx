import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommunityTabs from "./CommunityTabs";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ routines: [], pages: 1, vents: [], total: 0, displayName: null, current: null, unlocked: [], totalAvailable: 0 }),
  } as Response);
});

describe("CommunityTabs", () => {
  it("renders Routines and Vents tabs", () => {
    render(<CommunityTabs />);
    expect(screen.getByRole("tab", { name: "Routines" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vents" })).toBeInTheDocument();
  });

  it("shows Routines tab as active by default", () => {
    render(<CommunityTabs />);
    const routinesTab = screen.getByRole("tab", { name: "Routines" });
    expect(routinesTab).toHaveAttribute("aria-selected", "true");
  });

  it("switches to Vents tab on click", async () => {
    render(<CommunityTabs />);
    await userEvent.click(screen.getByRole("tab", { name: "Vents" }));
    const ventsTab = screen.getByRole("tab", { name: "Vents" });
    expect(ventsTab).toHaveAttribute("aria-selected", "true");
  });
});
