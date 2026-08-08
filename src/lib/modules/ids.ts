export const CANONICAL_MODULE_IDS = [
  "task-manager",
  "productivity",
  "focus-habits",
  "routine-builder",
  "wellness-tracker",
  "reminders",
  "gamification",
  "community",
] as const;

const PERSISTED_TO_NAVIGATION_ID: Record<string, string> = {
  "task-manager": "tasks",
  productivity: "productivity",
  "focus-habits": "focus-habits",
  "routine-builder": "routines",
  "wellness-tracker": "wellness",
  reminders: "reminders",
  gamification: "gamification",
  community: "community",
};

const NAVIGATION_TO_PERSISTED_ID = Object.fromEntries(
  Object.entries(PERSISTED_TO_NAVIGATION_ID).map(([persistedId, navigationId]) => [
    navigationId,
    persistedId,
  ])
);

export function toNavigationModuleId(moduleId: string): string {
  return PERSISTED_TO_NAVIGATION_ID[moduleId] ?? moduleId;
}

export function toPersistedModuleId(navigationId: string): string {
  return NAVIGATION_TO_PERSISTED_ID[navigationId] ?? navigationId;
}

export function isCanonicalModuleId(moduleId: string): boolean {
  return Object.prototype.hasOwnProperty.call(PERSISTED_TO_NAVIGATION_ID, moduleId);
}
