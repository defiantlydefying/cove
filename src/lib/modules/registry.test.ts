// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { ModuleRegistry } from "./registry";
import { ModuleDefinition } from "@/types/module";

const makeModule = (overrides: Partial<ModuleDefinition> = {}): ModuleDefinition => ({
  id: "test-module",
  name: "Test Module",
  description: "A module used for testing",
  defaultEnabled: true,
  zone: "main",
  ...overrides,
});

describe("ModuleRegistry", () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  it("registers a module", () => {
    const mod = makeModule();
    registry.register(mod);
    expect(registry.get("test-module")).toEqual(mod);
  });

  it("returns undefined for unregistered module", () => {
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("lists all registered modules", () => {
    const a = makeModule({ id: "a", name: "A" });
    const b = makeModule({ id: "b", name: "B" });
    registry.register(a);
    registry.register(b);
    expect(registry.getAll()).toEqual([a, b]);
  });

  it("lists modules by zone", () => {
    const main = makeModule({ id: "main-mod", zone: "main" });
    const sidebar = makeModule({ id: "sidebar-mod", zone: "sidebar" });
    registry.register(main);
    registry.register(sidebar);

    expect(registry.getByZone("main")).toEqual([main]);
    expect(registry.getByZone("sidebar")).toEqual([sidebar]);
  });

  it("returns default enabled modules", () => {
    const enabled = makeModule({ id: "enabled", defaultEnabled: true });
    const disabled = makeModule({ id: "disabled", defaultEnabled: false });
    registry.register(enabled);
    registry.register(disabled);

    expect(registry.getDefaultEnabled()).toEqual([enabled]);
  });
});
