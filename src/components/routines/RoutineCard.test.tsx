import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RoutineCard, { Routine } from "./RoutineCard";

const baseRoutine: Routine = {
  id: "r1",
  name: "Morning routine",
  steps: [
    { id: "s1", title: "Stretch" },
    { id: "s2", title: "Meditate" },
    { id: "s3", title: "Journal" },
  ],
  active: true,
};

describe("RoutineCard", () => {
  it("renders routine name", () => {
    render(
      <RoutineCard
        routine={baseRoutine}
        completedSteps={[]}
        onStepToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Morning routine")).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(
      <RoutineCard
        routine={baseRoutine}
        completedSteps={[]}
        onStepToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Stretch")).toBeInTheDocument();
    expect(screen.getByText("Meditate")).toBeInTheDocument();
    expect(screen.getByText("Journal")).toBeInTheDocument();
  });

  it("shows correct progress count", () => {
    render(
      <RoutineCard
        routine={baseRoutine}
        completedSteps={["s1", "s3"]}
        onStepToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("2/3 steps done")).toBeInTheDocument();
  });

  it("calls onStepToggle when step checkbox clicked", async () => {
    const onStepToggle = vi.fn();
    render(
      <RoutineCard
        routine={baseRoutine}
        completedSteps={[]}
        onStepToggle={onStepToggle}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    await userEvent.click(screen.getByLabelText("Toggle Stretch"));
    expect(onStepToggle).toHaveBeenCalledWith("r1", "s1", true);
  });

  it("shows muted styling for inactive routines", () => {
    const inactive = { ...baseRoutine, active: false };
    render(
      <RoutineCard
        routine={inactive}
        completedSteps={[]}
        onStepToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    const card = screen.getByTestId("routine-card");
    expect(card.className).toContain("opacity-50");
  });
});
