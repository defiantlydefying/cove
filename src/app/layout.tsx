import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import CapacitorInit from "@/components/CapacitorInit";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for headlines — Krylon (Tom Robin Karlsson), self-hosted.
// Elegant, light, editorial; the character the marketing pages need.
const displaySerif = localFont({
  src: [
    { path: "../../public/fonts/Krylon-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Krylon-Regular.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-display-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cove",
  description: "Your executive function companion",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/branding/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#4A5D4E",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        <CapacitorInit />
        <ServiceWorkerRegistrar />
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
