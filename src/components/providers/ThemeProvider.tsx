"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { syncStatusBar } from "@/lib/capacitor/status-bar";

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
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    if (!session) return;

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.theme) {
          setThemeState(data.theme);
          document.documentElement.setAttribute("data-theme", data.theme);
          syncStatusBar(data.theme);
        }
      })
      .catch(() => {});
  }, [session]);

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
