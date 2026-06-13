import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VentFeed from "./VentFeed";

const mockVents = [
  {
    id: "v1",
    body: "Having a rough day",
    lifespan: "48h",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    contactPreference: "both",
    createdAt: new Date().toISOString(),
    displayName: "calm_river_42",
    avatarKey: "fox",
    commentCount: 2,
    isOwn: false,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VentFeed", () => {
  it("shows loading state", () => {
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    const { container } = render(<VentFeed />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders vents after fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: mockVents, pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText("Having a rough day")).toBeInTheDocument();
    });
    expect(screen.getByText("calm_river_42")).toBeInTheDocument();
  });

  it("shows new vent form when button clicked", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: [], pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText("+ New vent")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("+ New vent"));
    expect(screen.getByPlaceholderText(/let it out/i)).toBeInTheDocument();
  });

  it("shows guidelines banner", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vents: [], pages: 1 }),
    } as Response);

    render(<VentFeed />);
    await waitFor(() => {
      expect(screen.getByText(/safe space/i)).toBeInTheDocument();
    });
  });
});
