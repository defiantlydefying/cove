"use client";

const LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

const LEVEL_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-red-100", text: "text-red-600" },
  2: { bg: "bg-orange-100", text: "text-orange-600" },
  3: { bg: "bg-yellow-100", text: "text-yellow-600" },
  4: { bg: "bg-emerald-100", text: "text-emerald-600" },
  5: { bg: "bg-cove-accent-light", text: "text-cove-accent" },
};

export interface CheckinRecord {
  id: string;
  date: string;
  mood?: number | null;
  energy?: number | null;
  sleep?: number | null;
  notes?: string | null;
}

export interface PatternsData {
  overall: {
    mood: number | null;
    energy: number | null;
    sleep: number | null;
    totalCheckins: number;
  };
  byDayOfWeek: Record<
    string,
    { mood: number | null; energy: number | null; sleep: number | null }
  >;
}

interface WellnessHistoryProps {
  checkins: CheckinRecord[];
  patterns?: PatternsData | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function LevelBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-cove-muted">--</span>;
  const label = LABELS[value] ?? String(value);
  const colors = LEVEL_COLORS[value] ?? { bg: "bg-cove-offwhite", text: "text-cove-muted" };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

function MiniBar({ value }: { value: number | null | undefined }) {
  const level = value ?? 0;
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm transition-colors ${
            i <= level
              ? level >= 4
                ? "bg-cove-accent"
                : level >= 3
                ? "bg-yellow-400"
                : "bg-orange-400"
              : "bg-cove-border-light"
          }`}
        />
      ))}
    </div>
  );
}

function AvgStat({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  const rounded = Math.round(value * 10) / 10;
  const percentage = (rounded / 5) * 100;
  return (
    <div className="flex-1">
      <p className="text-xs text-cove-muted mb-1">{label}</p>
      <p className="text-lg font-semibold text-cove-charcoal">{rounded}</p>
      <div className="h-1.5 w-full bg-cove-border-light rounded-full mt-1 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cove-accent to-cove-blue transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function WellnessHistory({
  checkins,
  patterns,
}: WellnessHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-cove-charcoal mb-4">Recent Check-ins</h2>

      {patterns && patterns.overall.totalCheckins > 0 && (
        <div
          className="mb-5 p-4 bg-cove-card border border-cove-border-light rounded-2xl shadow-sm"
          data-testid="patterns-summary"
        >
          <p className="text-sm font-medium text-cove-charcoal mb-3">30-Day Averages</p>
          <div className="flex gap-6">
            <AvgStat label="Mood" value={patterns.overall.mood} />
            <AvgStat label="Energy" value={patterns.overall.energy} />
            <AvgStat label="Sleep" value={patterns.overall.sleep} />
          </div>
        </div>
      )}

      {checkins.length === 0 ? (
        <p className="text-sm text-cove-muted">No check-ins yet. Complete your first check-in to start tracking.</p>
      ) : (
        <div className="bg-cove-card border border-cove-border-light rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Check-in history">
            <thead>
              <tr className="bg-cove-offwhite">
                <th className="py-3 px-4 text-left text-xs font-medium text-cove-muted uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-cove-muted uppercase tracking-wider">Mood</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-cove-muted uppercase tracking-wider">Energy</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-cove-muted uppercase tracking-wider">Sleep</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-cove-muted uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c, index) => (
                <tr
                  key={c.id}
                  className={`border-t border-cove-border-light transition-colors hover:bg-cove-accent-light/30 ${
                    index % 2 === 0 ? "" : "bg-cove-offwhite/50"
                  }`}
                >
                  <td className="py-3 px-4 text-cove-charcoal font-medium">
                    {formatDate(c.date)}
                  </td>
                  <td className="py-3 px-4">
                    <LevelBadge value={c.mood} />
                  </td>
                  <td className="py-3 px-4">
                    <LevelBadge value={c.energy} />
                  </td>
                  <td className="py-3 px-4">
                    <LevelBadge value={c.sleep} />
                  </td>
                  <td className="py-3 px-4">
                    <MiniBar value={c.mood} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
