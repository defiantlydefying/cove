import type { NextConfig } from "next";

// Content-Security-Policy enforces Cove's "no third-party trackers" promise in code.
// We allow the app's own inline scripts/styles (Next.js hydration + Framer Motion),
// but permit NO third-party script or connect origins — so analytics/tracking beacons
// and pixels are blocked by the browser, not just absent from the bundle. Images are
// allowlisted to the two origins we actually use (DiceBear avatars, Google OAuth photos).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://api.dicebear.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable features we don't use; opt out of FLoC/Topics tracking. Mic + camera
  // stay enabled (self) for voice and image capture.
  {
    key: "Permissions-Policy",
    value: "geolocation=(), browsing-topics=(), interest-cohort=(), camera=(self), microphone=(self)",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
