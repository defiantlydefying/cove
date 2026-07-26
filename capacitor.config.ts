import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.COVE_SERVER_URL ?? "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "app.cove.companion",
  appName: "Cove",
  webDir: "native-shell",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FAF8F5",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_cove",
      iconColor: "#6B8F71",
    },
  },
};

export default config;
