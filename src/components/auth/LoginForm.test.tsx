import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import LoginForm from "./LoginForm";

const { isNativeMock, nativeGoogleSignInMock } = vi.hoisted(() => ({
  isNativeMock: vi.fn(),
  nativeGoogleSignInMock: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/lib/capacitor", () => ({
  isNative: isNativeMock,
}));

vi.mock("@/lib/capacitor/google-auth", () => ({
  signInWithNativeGoogle: nativeGoogleSignInMock,
  isNativeGoogleCancel: (error: unknown) =>
    typeof error === "object" && error !== null && "code" in error && error.code === "SIGN_IN_CANCELED",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  isNativeMock.mockReturnValue(false);
  nativeGoogleSignInMock.mockReset();
});

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the sign in button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: "Create one" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });

  it("keeps a visible loading handoff after native Google succeeds", async () => {
    isNativeMock.mockReturnValue(true);
    nativeGoogleSignInMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(screen.getByRole("status")).toHaveTextContent("Signing you in");
    const loadingButton = screen.getByRole("button", { name: "Signing you in..." });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton.closest("form")).toHaveAttribute("aria-busy", "true");
  });
});
