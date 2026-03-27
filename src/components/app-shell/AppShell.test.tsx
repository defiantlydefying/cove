import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SessionProvider } from "next-auth/react";
import AppShell from "./AppShell";

const tabs = [
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
];

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
    // Sidebar is visible initially, so no "Open sidebar" button
    expect(screen.queryByLabelText("Open sidebar")).not.toBeInTheDocument();

    // Dismiss sidebar
    await userEvent.click(screen.getByLabelText("Close sidebar"));
    expect(screen.getByLabelText("Open sidebar")).toBeInTheDocument();

    // Reopen sidebar
    await userEvent.click(screen.getByLabelText("Open sidebar"));
    expect(screen.queryByLabelText("Open sidebar")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
  });

  it("renders header with app name Cove", () => {
    renderShell();
    expect(screen.getByText("Cove")).toBeInTheDocument();
  });
});
