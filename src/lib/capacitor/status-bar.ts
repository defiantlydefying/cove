import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function syncStatusBar(theme: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await StatusBar.setStyle({
    style: theme === "dark" ? Style.Dark : Style.Light,
  });
}
