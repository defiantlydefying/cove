"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      window.location.href = "/";
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
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
          className="mt-1 block w-full rounded-lg border border-cove-border px-3 py-2.5 text-sm bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:border-cove-accent focus:outline-none focus:ring-2 focus:ring-cove-accent/20 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cove-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cove-accent-hover focus:outline-none focus:ring-2 focus:ring-cove-accent/40 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in..." : "Sign in"}
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
