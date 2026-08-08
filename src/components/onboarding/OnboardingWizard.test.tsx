import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingWizard from "./OnboardingWizard";

beforeEach(() => {
  window.scrollTo = vi.fn();
});

async function advanceTo(step: "profile" | "companion" | "modules" | "theme" | "done") {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /make cove mine/i }));

  const order = ["profile", "companion", "modules", "theme", "done"];
  for (let index = 0; index < order.indexOf(step); index += 1) {
    await user.click(screen.getByRole("button", { name: /continue/i }));
  }

  return user;
}

describe("OnboardingWizard", () => {
  it("renders the light welcome experience initially", () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);

    expect(screen.getByTestId("welcome-step")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Cove")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "light");
  });

  it("navigates through the personal setup steps", async () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await advanceTo("profile");
    expect(screen.getByTestId("profile-step")).toBeInTheDocument();
    expect(screen.getByText("A little about you")).toBeInTheDocument();
  });

  it("shows compact module switches and updates their state", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /make cove mine/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByTestId("modules-step")).toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(8);
    for (const moduleSwitch of screen.getAllByRole("switch")) {
      expect(moduleSwitch).toHaveAttribute("aria-checked", "true");
    }
    expect(screen.getByRole("switch", { name: /disable planner/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /disable focus & habits/i })).toBeInTheDocument();

    const routinesSwitch = screen.getByRole("switch", { name: /disable routines/i });
    expect(routinesSwitch).toHaveAttribute("aria-checked", "true");
    await user.click(routinesSwitch);
    expect(screen.getByRole("switch", { name: /enable routines/i })).toHaveAttribute("aria-checked", "false");
  });

  it("offers explicit appearance choices", async () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await advanceTo("theme");
    expect(screen.getByTestId("theme-step")).toBeInTheDocument();
    expect(screen.getByText("Choose your style")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /light/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a setup summary before entering Cove", async () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await advanceTo("done");
    expect(screen.getByTestId("done-step")).toBeInTheDocument();
    expect(screen.getByText("Your Cove is ready")).toBeInTheDocument();
  });

  it("saves the setup and calls onComplete", async () => {
    const onComplete = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    render(<OnboardingWizard onComplete={onComplete} />);

    const user = await advanceTo("done");
    await user.click(screen.getByRole("button", { name: /enter cove/i }));

    expect(global.fetch).toHaveBeenCalledOnce();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/onboarding",
      expect.objectContaining({ method: "PATCH" })
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("retries once when the database is waking up", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onComplete = vi.fn();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    render(<OnboardingWizard onComplete={onComplete} />);

    const user = await advanceTo("done");
    await user.click(screen.getByRole("button", { name: /enter cove/i }));

    await vi.waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    expect(global.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
