import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSchedule = vi.fn().mockResolvedValue({});
const mockCancel = vi.fn().mockResolvedValue({});
const mockRequestPermissions = vi.fn().mockResolvedValue({ display: "granted" });

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: mockSchedule,
    cancel: mockCancel,
    requestPermissions: mockRequestPermissions,
  },
}));

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scheduleReminder falls back on non-native", async () => {
    const { scheduleReminder } = await import("./notifications");
    await scheduleReminder({ id: "test-1", title: "Drink water", body: "Stay hydrated" });
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("cancelReminder is a no-op on web", async () => {
    const { cancelReminder } = await import("./notifications");
    await cancelReminder("test-1");
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
