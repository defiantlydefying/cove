import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionProvider } from "next-auth/react";
import AppShell from "./AppShell";

const tabs = [
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
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
        tabs={tabs}
        activeTab="plan"
        onTabChange={vi.fn()}
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

  it("renders tab bar with provided tabs", () => {
    renderShell();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
  });

  it("can dismiss and reopen sidebar", async () => {
    renderShell();

    // Dismiss sidebar
    await userEvent.click(screen.getByLabelText("Close sidebar"));

    // Reopen sidebar
    await userEvent.click(screen.getByLabelText("Open sidebar"));
    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
  });

  it("renders header with app name Cove", () => {
    renderShell();
    expect(screen.getByText("Cove")).toBeInTheDocument();
  });
});
