import { describe, it, vi } from "vitest";

const mockSetStyle = vi.fn().mockResolvedValue({});

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/status-bar", () => ({
  StatusBar: { setStyle: mockSetStyle },
  Style: { Dark: "DARK", Light: "LIGHT" },
}));

describe("status-bar", () => {
  it("syncStatusBar is a no-op on web", async () => {
    const { syncStatusBar } = await import("./status-bar");
    await syncStatusBar("dark");
  });
});
