import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import ToastProvider from "@/components/providers/ToastProvider";

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { renderWithProviders as render };
export { screen, waitFor, within, act, fireEvent } from "@testing-library/react";
