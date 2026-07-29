import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionProvider } from "next-auth/react";
import AppShell from "./AppShell";

const navItems = [
  { id: "daily-view", label: "Daily View", icon: <span aria-hidden="true">D</span> },
  { id: "tasks", label: "Tasks", icon: <span aria-hidden="true">T</span> },
  { id: "companion", label: "Companion", icon: <span aria-hidden="true">C</span> },
  { id: "productivity", label: "Planner", icon: <span aria-hidden="true">P</span> },
];

beforeEach(() => {
  // Mock matchMedia to simulate desktop viewport
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(min-width: 768px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderShell() {
  return render(
    <SessionProvider session={null}>
      <AppShell
        navItems={navItems}
        activeItem="daily-view"
        onItemChange={vi.fn()}
        sidebarContent={<p>Sidebar tasks</p>}
      >
        <p>Main content</p>
      </AppShell>
    </SessionProvider>
  );
}

describe("AppShell", () => {
  it("renders main area and sidebar", () => {
    renderShell();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Sidebar tasks")).toBeInTheDocument();
  });

  it("renders native navigation with primary destinations", () => {
    renderShell();
    const navigation = screen.getByRole("navigation", {
      name: "App navigation",
    });
    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan" })).toBeInTheDocument();
  });

  it("uses a native-friendly Today title for the daily view", () => {
    renderShell();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
  });
});
