"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { isNative } from "@/lib/capacitor";
import {
  isNativeGoogleCancel,
  signInWithNativeGoogle,
} from "@/lib/capacitor/google-auth";
import AuthLoading from "./AuthLoading";

// NextAuth redirects back to the sign-in page with ?error=<code> when OAuth fails.
// Map the common codes to friendly text (and show the raw code so failures aren't silent).
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with your password instead.",
  OAuthCallback: "Google sign-in could not be completed. Please try again.",
  Callback: "Sign-in could not be completed. Please try again.",
  AccessDenied: "Access was denied. Please try a different account.",
  Configuration: "Sign-in is misconfigured. Please contact support.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;
    const timer = window.setTimeout(() => {
      setError(ERROR_MESSAGES[code] ?? `Sign-in failed (${code}).`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = "/dashboard?welcome=1";
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      if (isNative()) {
        await signInWithNativeGoogle("/dashboard?welcome=1");
      } else {
        await signIn("google", { callbackUrl: "/dashboard?welcome=1" });
      }
    } catch (googleError) {
      if (!isNativeGoogleCancel(googleError)) {
        setError("Google sign-in could not be completed. Please try again.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5"
      aria-busy={googleLoading}
    >
      {googleLoading && (
        <AuthLoading
          message="Signing you in…"
          detail="Finishing securely with Google…"
        />
      )}
      {error && (
        <p className="text-sm text-cove-error" role="alert">{error}</p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-cove-charcoal mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!error}
          className="mt-1 block w-full rounded-lg border border-cove-border px-3 py-2.5 text-sm bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:border-cove-accent focus:outline-none focus:ring-2 focus:ring-cove-accent/20 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-cove-charcoal mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={!!error}
          className="mt-1 block w-full rounded-lg border border-cove-border px-3 py-2.5 text-sm bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:border-cove-accent focus:outline-none focus:ring-2 focus:ring-cove-accent/20 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full rounded-lg bg-cove-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cove-accent-hover focus:outline-none focus:ring-2 focus:ring-cove-accent/40 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-cove-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-cove-card px-3 text-cove-muted">or</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-cove-border bg-cove-offwhite px-4 py-2.5 text-sm font-medium text-cove-charcoal hover:bg-cove-border-light transition-colors"
      >
        {googleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cove-accent/20 border-t-cove-accent" aria-hidden="true" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? "Signing you in..." : "Continue with Google"}
      </button>
      <p className="text-center text-sm text-cove-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cove-sage font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
