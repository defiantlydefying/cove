import { ModuleDefinition } from "@/types/module";

export class ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();

  register(module: ModuleDefinition): void {
    this.modules.set(module.id, module);
  }

  get(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  getByZone(zone: "main" | "sidebar"): ModuleDefinition[] {
    return this.getAll().filter((m) => m.zone === zone);
  }

  getDefaultEnabled(): ModuleDefinition[] {
    return this.getAll().filter((m) => m.defaultEnabled);
  }
}

export const moduleRegistry = new ModuleRegistry();
