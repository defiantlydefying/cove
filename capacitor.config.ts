import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.cove.companion",
  appName: "Cove",
  server: {
    url: "http://localhost:3000",
    cleartext: true,
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
