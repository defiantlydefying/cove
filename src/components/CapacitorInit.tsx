"use client";

import { useEffect } from "react";
import { isNative, isIOS } from "@/lib/capacitor";

export default function CapacitorInit() {
  useEffect(() => {
    if (isIOS()) {
      document.body.classList.add("capacitor-ios");
    }
    if (isNative()) {
      document.body.classList.add("capacitor-native");
      import("@capacitor/splash-screen").then(({ SplashScreen }) => {
        SplashScreen.hide();
      });
    }
  }, []);
  return null;
}
