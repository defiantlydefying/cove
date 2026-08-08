import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import RegisterForm from "./RegisterForm";

const { isNativeMock, nativeGoogleSignInMock } = vi.hoisted(() => ({
  isNativeMock: vi.fn(),
  nativeGoogleSignInMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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

describe("RegisterForm", () => {
  it("renders name, email, and password fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the create account button", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("renders a link to the login page", () => {
    render(<RegisterForm />);
    const link = screen.getByRole("link", { name: "Sign in" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("shows a loading handoff while Google creates the account", async () => {
    isNativeMock.mockReturnValue(true);
    nativeGoogleSignInMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Sign up with Google" }));

    expect(screen.getByRole("status")).toHaveTextContent("Creating your Cove");
    const loadingButton = screen.getByRole("button", { name: "Signing you in..." });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton.closest("form")).toHaveAttribute("aria-busy", "true");
  });
});
