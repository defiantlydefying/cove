import { describe, expect, it } from "vitest";
import {
  isCanonicalModuleId,
  toNavigationModuleId,
  toPersistedModuleId,
} from "./ids";

describe("module ID mapping", () => {
  it("maps persisted module IDs to dashboard navigation IDs", () => {
    expect(toNavigationModuleId("task-manager")).toBe("tasks");
    expect(toNavigationModuleId("routine-builder")).toBe("routines");
    expect(toNavigationModuleId("wellness-tracker")).toBe("wellness");
  });

  it("maps dashboard navigation IDs back to persisted settings", () => {
    expect(toPersistedModuleId("tasks")).toBe("task-manager");
    expect(toPersistedModuleId("routines")).toBe("routine-builder");
    expect(toPersistedModuleId("wellness")).toBe("wellness-tracker");
  });

  it("leaves shared and unknown IDs unchanged", () => {
    expect(toNavigationModuleId("community")).toBe("community");
    expect(toPersistedModuleId("custom-module")).toBe("custom-module");
    expect(isCanonicalModuleId("community")).toBe(true);
    expect(isCanonicalModuleId("tasks")).toBe(false);
  });
});
