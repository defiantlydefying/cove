import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WellnessHistory, { CheckinRecord, PatternsData } from "./WellnessHistory";

const sampleCheckins: CheckinRecord[] = [
  {
    id: "1",
    date: "2026-03-25T00:00:00.000Z",
    mood: 4,
    energy: 3,
    sleep: 5,
    notes: null,
  },
  {
    id: "2",
    date: "2026-03-24T00:00:00.000Z",
    mood: 2,
    energy: 4,
    sleep: 3,
    notes: "Slept poorly",
  },
];

const samplePatterns: PatternsData = {
  overall: {
    mood: 3.5,
    energy: 3.2,
    sleep: 4.0,
    totalCheckins: 10,
  },
  byDayOfWeek: {
    Monday: { mood: 3, energy: 2.5, sleep: 4 },
    Tuesday: { mood: 4, energy: 3, sleep: 3.5 },
    Wednesday: { mood: null, energy: null, sleep: null },
    Thursday: { mood: null, energy: null, sleep: null },
    Friday: { mood: null, energy: null, sleep: null },
    Saturday: { mood: null, energy: null, sleep: null },
    Sunday: { mood: null, energy: null, sleep: null },
  },
};

describe("WellnessHistory", () => {
  it("renders check-in history", () => {
    render(<WellnessHistory checkins={sampleCheckins} />);
    expect(screen.getByText("Recent Check-ins")).toBeInTheDocument();
    expect(screen.getAllByText("Good")).toHaveLength(2); // mood 4 + energy 4
    expect(screen.getByText("Low")).toBeInTheDocument(); // mood 2
    expect(screen.getByText("Great")).toBeInTheDocument(); // sleep 5
  });

  it("shows empty state when no check-ins", () => {
    render(<WellnessHistory checkins={[]} />);
    expect(screen.getByText(/No check-ins yet/)).toBeInTheDocument();
  });

  it("shows pattern summary when patterns data is available", () => {
    render(
      <WellnessHistory checkins={sampleCheckins} patterns={samplePatterns} />
    );
    expect(screen.getByTestId("patterns-summary")).toBeInTheDocument();
    expect(screen.getByText("3.2")).toBeInTheDocument();
    expect(screen.getByText("3.5")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("does not show pattern summary when patterns is null", () => {
    render(<WellnessHistory checkins={sampleCheckins} patterns={null} />);
    expect(screen.queryByTestId("patterns-summary")).not.toBeInTheDocument();
  });
});
