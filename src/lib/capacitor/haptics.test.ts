import { describe, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: { Light: "LIGHT", Medium: "MEDIUM" },
  NotificationType: { Success: "SUCCESS" },
}));

describe("haptics", () => {
  it("tapLight is a no-op on web", async () => {
    const { tapLight } = await import("./haptics");
    await tapLight();
  });

  it("tapMedium is a no-op on web", async () => {
    const { tapMedium } = await import("./haptics");
    await tapMedium();
  });

  it("success is a no-op on web", async () => {
    const { success } = await import("./haptics");
    await success();
  });
});
