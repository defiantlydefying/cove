"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info" | "reminder";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  actions?: ToastAction[];
}

interface ToastContextValue {
  toast: (
    message: string,
    type?: ToastType,
    duration?: number,
    actions?: ToastAction[]
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TOAST_DURATION = 3500;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration?: number,
      actions?: ToastAction[]
    ) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type, actions }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration ?? TOAST_DURATION);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-toast-in ${
              t.type === "success"
                ? "bg-emerald-600 text-white max-w-sm"
                : t.type === "error"
                ? "bg-red-600 text-white max-w-sm"
                : t.type === "reminder"
                ? "bg-cove-sidebar text-cove-sidebar-text max-w-md"
                : "bg-cove-charcoal text-white max-w-sm"
            }`}
          >
            <div>{t.message}</div>
            {t.actions && t.actions.length > 0 && (
              <div className="flex gap-2 mt-2">
                {t.actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      action.onClick();
                      dismiss(t.id);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-auto"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
