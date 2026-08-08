"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { syncStatusBar } from "@/lib/capacitor/status-bar";

const ACCENT_MAP: Record<string, { hover: string; light: string; sidebar: string }> = {
  "#6B8F71": { hover: "#5A7D60", light: "#EAF0EB", sidebar: "#4A5D4E" },
  "#7EAAA0": { hover: "#6B9A90", light: "#E6F0ED", sidebar: "#4A5D5E" },
  "#C4A055": { hover: "#B08E45", light: "#F5EFE0", sidebar: "#5D5440" },
  "#A08BA0": { hover: "#8E788E", light: "#F0EBF0", sidebar: "#5A4D5A" },
  "#4A5D4E": { hover: "#3D4F40", light: "#E8EDE9", sidebar: "#3D4F40" },
  "#8FA89A": { hover: "#7D968A", light: "#ECF2EE", sidebar: "#4A5D50" },
};

function applyAccentToDOM(hex: string) {
  const accent = ACCENT_MAP[hex];
  if (!accent) return;
  const root = document.documentElement;
  root.style.setProperty("--cove-accent", hex);
  root.style.setProperty("--cove-accent-hover", accent.hover);
  root.style.setProperty("--cove-accent-light", accent.light);
  root.style.setProperty("--cove-sidebar", accent.sidebar);
  root.style.setProperty("--cove-gradient-start", accent.sidebar);
  root.style.setProperty("--cove-gradient-end", hex);
  root.style.setProperty("--cove-selection", hex + "33");
}

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const isPreAppRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/onboarding" ||
      pathname === "/age-check";

    if (isPreAppRoute || !session) {
      document.documentElement.setAttribute("data-theme", "light");
      syncStatusBar("light");
      return;
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.theme === "light" || data.theme === "dark") {
          setThemeState(data.theme);
          document.documentElement.setAttribute("data-theme", data.theme);
          syncStatusBar(data.theme);
        }
        if (data.accentColor) {
          applyAccentToDOM(data.accentColor);
        }
        if (data.fontSize) {
          document.documentElement.setAttribute("data-font-size", data.fontSize);
        }
        if (data.density) {
          document.documentElement.setAttribute("data-density", data.density);
        }
      })
      .catch(() => {});
  }, [pathname, session]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    syncStatusBar(newTheme);

    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
