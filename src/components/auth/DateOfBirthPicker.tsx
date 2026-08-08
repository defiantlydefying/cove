"use client";

import { useEffect, useMemo, useState } from "react";

// A date-of-birth picker built from three dropdowns (Month / Day / Year) instead
// of a native <input type="date">. For a birthday, a calendar is hostile UX — you
// have to page back hundreds of months — whereas three selects let you jump
// straight to the year. The value out is a "YYYY-MM-DD" string (empty until all
// three parts are chosen), so callers and the age helpers in @/lib/age can stay
// unchanged.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// month is 1-12; day 0 of the following month is the last day of this one.
function daysInMonth(year: number, month: number): number {
  if (!month) return 31;
  // Fall back to a leap year when no year is chosen yet, so Feb 29 stays selectable.
  return new Date(year || 2000, month, 0).getDate();
}

function parse(value: string): { year: number; month: number; day: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return { year: 0, month: 0, day: 0 };
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function ChevronField({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cove-muted"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  );
}

const selectClass =
  "w-full appearance-none rounded-lg border border-cove-border bg-cove-offwhite px-3 py-2.5 pr-9 text-sm text-cove-charcoal cursor-pointer focus:border-cove-accent focus:outline-none focus:ring-2 focus:ring-cove-accent/20 transition-colors";

export default function DateOfBirthPicker({
  value,
  onChange,
  id = "dateOfBirth",
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  // Each part is tracked independently so a single dropdown can be set on its own.
  // We only roll them up into a complete "YYYY-MM-DD" string once all three exist;
  // deriving the part state from `value` alone would discard partial selections.
  const [parts, setParts] = useState(() => parse(value));
  const { year, month, day } = parts;

  // Stay in sync if the parent resets `value` to a complete date or to "".
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (value === "") {
        setParts((p) => (p.year || p.month || p.day ? { year: 0, month: 0, day: 0 } : p));
      } else {
        const next = parse(value);
        setParts((p) =>
          p.year === next.year && p.month === next.month && p.day === next.day ? p : next,
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 120 }, (_, i) => currentYear - i),
    [currentYear],
  );
  const days = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month]);

  const update = (next: Partial<typeof parts>) => {
    const merged = { ...parts, ...next };
    // Clamp the day so a Feb-31 style combination can never survive a month/year change.
    if (merged.day) merged.day = Math.min(merged.day, daysInMonth(merged.year, merged.month));
    setParts(merged);
    if (merged.year && merged.month && merged.day) {
      onChange(
        `${merged.year}-${String(merged.month).padStart(2, "0")}-${String(merged.day).padStart(2, "0")}`,
      );
    } else {
      onChange("");
    }
  };

  return (
    <div className="grid grid-cols-[1.4fr_1fr_1.1fr] gap-2" role="group" aria-labelledby={`${id}-label`}>
      <ChevronField>
        <select
          id={id}
          aria-label="Birth month"
          value={month || ""}
          onChange={(e) => update({ month: Number(e.target.value) })}
          required
          className={selectClass}
        >
          <option value="" disabled>Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
      </ChevronField>

      <ChevronField>
        <select
          aria-label="Birth day"
          value={day || ""}
          onChange={(e) => update({ day: Number(e.target.value) })}
          required
          className={selectClass}
        >
          <option value="" disabled>Day</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </ChevronField>

      <ChevronField>
        <select
          aria-label="Birth year"
          value={year || ""}
          onChange={(e) => update({ year: Number(e.target.value) })}
          required
          className={selectClass}
        >
          <option value="" disabled>Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </ChevronField>
    </div>
  );
}
