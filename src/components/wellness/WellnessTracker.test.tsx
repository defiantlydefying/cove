import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WellnessTracker from "./WellnessTracker";

const mockCheckins = [
  {
    id: "1",
    date: new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
    mood: 4,
    energy: 3,
    sleep: 5,
    notes: null,
  },
];

const mockPatterns = {
  overall: { mood: 3.5, energy: 3.2, sleep: 4.0, totalCheckins: 5 },
  byDayOfWeek: {},
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("WellnessTracker", () => {
  it("shows loading state initially", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    render(<WellnessTracker />);
    expect(screen.getByText("Loading wellness data...")).toBeInTheDocument();
  });

  it("renders check-in form and history after fetch", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/patterns")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPatterns),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCheckins),
      } as Response);
    });

    render(<WellnessTracker />);

    await waitFor(() => {
      expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
    });

    expect(screen.getByText("Recent Check-ins")).toBeInTheDocument();
    expect(screen.getByText("Save check-in")).toBeInTheDocument();
  });
});
