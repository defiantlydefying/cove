import { describe, it, expect, vi, beforeEach } from "vitest";

describe("capacitor platform detection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("isNative returns false when Capacitor is not present", async () => {
    const mod = await import("./index");
    expect(mod.isNative()).toBe(false);
  });

  it("isIOS returns false when not on iOS", async () => {
    const mod = await import("./index");
    expect(mod.isIOS()).toBe(false);
  });
});
