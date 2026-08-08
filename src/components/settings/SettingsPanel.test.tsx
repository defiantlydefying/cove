import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SettingsPanel from "./SettingsPanel";

const mockSettings = {
  theme: "light",
  accentColor: "#4F7CAC",
  density: "comfortable",
  animationsOn: true,
  soundsOn: true,
  fontSize: "medium",
  tone: "encouraging",
};

const mockModules = [
  { moduleId: "task-manager", enabled: true },
  { moduleId: "routine-builder", enabled: false },
];

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/settings/modules") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockModules),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });
  });
});

describe("SettingsPanel", () => {
  it("shows loading state", () => {
    render(<SettingsPanel />);
    expect(screen.getByTestId("settings-loading")).toBeInTheDocument();
  });

  it("renders settings after fetch", async () => {
    render(<SettingsPanel />);
    await waitFor(() => {
      expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
    });
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("toggles theme", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Dark"));

    expect(global.fetch).toHaveBeenCalledWith("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: "dark" }),
    });
  });

  it("treats modules without a saved preference as enabled", async () => {
    render(<SettingsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
    });

    expect(screen.getByRole("switch", { name: "Toggle Planner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("switch", { name: "Toggle Routine Builder" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });
});
