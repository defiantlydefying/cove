import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import OnboardingWizard from "./OnboardingWizard";

describe("OnboardingWizard", () => {
  it("renders welcome step initially", () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);
    expect(screen.getByTestId("welcome-step")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Cove")).toBeInTheDocument();
  });

  it("navigates to module selection on Next", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByText("Next"));
    expect(screen.getByTestId("modules-step")).toBeInTheDocument();
    expect(screen.getByText("Choose your modules")).toBeInTheDocument();
  });

  it("navigates to theme selection", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));
    expect(screen.getByTestId("theme-step")).toBeInTheDocument();
    expect(screen.getByText("Customize your experience")).toBeInTheDocument();
  });

  it("shows completion step", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));
    expect(screen.getByTestId("done-step")).toBeInTheDocument();
    expect(screen.getByText("Your cove is ready")).toBeInTheDocument();
  });

  it("calls onComplete when Get Started clicked", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<OnboardingWizard onComplete={onComplete} />);

    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Get started"));

    expect(onComplete).toHaveBeenCalled();
  });
});
