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
    const routinesSwitch = screen.getByRole("switch", { name: /enable routines/i });
    expect(routinesSwitch).toHaveAttribute("aria-checked", "false");
    await user.click(routinesSwitch);
    expect(screen.getByRole("switch", { name: /disable routines/i })).toHaveAttribute("aria-checked", "true");
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

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
