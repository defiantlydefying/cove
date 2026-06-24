"use client";

import { CRISIS_RESOURCES } from "@/lib/crisis";

// Rendered inline in the companion chat when the user's message trips crisis
// detection. Calm, non-alarming styling on purpose — a soft card, not a red alert —
// while still making the help unmistakable and one tap away.
export default function CrisisResources() {
  return (
    <div
      role="region"
      aria-label="Support resources"
      className="rounded-2xl border border-cove-accent/30 bg-cove-card p-4 shadow-sm"
    >
      <p className="text-sm text-cove-charcoal leading-relaxed mb-3">
        If you&apos;re thinking about harming yourself, please reach out to people
        who can help right now. You deserve support from someone who can be there
        with you.
      </p>
      <ul className="space-y-2.5">
        {CRISIS_RESOURCES.map((r) => (
          <li key={r.name} className="flex flex-col">
            <span className="text-sm font-semibold text-cove-charcoal">{r.name}</span>
            {r.href ? (
              <a
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel={r.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm text-cove-accent font-medium hover:underline"
              >
                {r.contact}
              </a>
            ) : (
              <span className="text-sm text-cove-accent font-medium">{r.contact}</span>
            )}
            <span className="text-xs text-cove-muted">{r.detail}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-cove-muted/70 mt-3 leading-relaxed">
        Cove is a wellness and productivity app, not a medical or crisis service.
      </p>
    </div>
  );
}
