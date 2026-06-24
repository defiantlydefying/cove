"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { isAtLeastAge, MIN_AGE } from "@/lib/age";
import DateOfBirthPicker from "@/components/auth/DateOfBirthPicker";

export default function AgeCheckForm({ next }: { next: string }) {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAtLeastAge(dateOfBirth, MIN_AGE)) {
      setBlocked(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateOfBirth }),
      });

      if (res.ok) {
        window.location.href = next;
      } else if (res.status === 403) {
        setBlocked(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Under-13 users are already authenticated via OAuth, so we sign them out to
  // prevent access rather than leaving them stuck on the gate.
  if (blocked) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm text-cove-charcoal leading-relaxed">
          {`Cove is only available to people aged ${MIN_AGE} and older. We're sorry — you won't be able to create an account right now.`}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-lg bg-cove-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cove-accent-hover transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-cove-error" role="alert">{error}</p>
      )}
      <div>
        <label id="dateOfBirth-label" htmlFor="dateOfBirth" className="block text-sm font-medium text-cove-charcoal mb-1.5">
          Date of birth
        </label>
        <DateOfBirthPicker value={dateOfBirth} onChange={setDateOfBirth} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cove-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cove-accent-hover focus:outline-none focus:ring-2 focus:ring-cove-accent/40 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {loading ? "Confirming..." : "Continue"}
      </button>
    </form>
  );
}
