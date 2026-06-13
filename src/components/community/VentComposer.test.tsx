import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VentComposer from "./VentComposer";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VentComposer", () => {
  it("renders textarea and lifespan options", () => {
    render(<VentComposer onCreated={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText(/let it out/i)).toBeInTheDocument();
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("48h")).toBeInTheDocument();
    expect(screen.getByText("5 days")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
  });

  it("disables post button when text is empty", () => {
    render(<VentComposer onCreated={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("calls onCreated after successful submit", async () => {
    const onCreated = vi.fn();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "v1" }),
    } as Response);

    render(<VentComposer onCreated={onCreated} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/let it out/i), "I'm so frustrated today");
    await userEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<VentComposer onCreated={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
