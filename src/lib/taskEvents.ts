// Lightweight cross-component signal so every task view stays in sync. The main
// Tasks pipeline, the sidebar "Today" drawer, and the Daily View card each fetch
// independently with no shared store, so when any one of them mutates a task we
// broadcast a window event and the others refetch.

export const TASKS_CHANGED = "cove:tasks-changed";

export function notifyTasksChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TASKS_CHANGED));
  }
}

export function onTasksChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TASKS_CHANGED, handler);
  return () => window.removeEventListener(TASKS_CHANGED, handler);
}
