"use client";

const LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
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

function valueLabel(val: number | null | undefined): string {
  if (val == null) return "-";
  return LABELS[val] ?? String(val);
}

export default function WellnessHistory({
  checkins,
  patterns,
}: WellnessHistoryProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>

      {patterns && (
        <div
          className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-gray-700"
          data-testid="patterns-summary"
        >
          <p className="font-medium mb-1">30-Day Averages</p>
          {patterns.overall.mood != null && (
            <p>Your average mood is {patterns.overall.mood}</p>
          )}
          {patterns.overall.energy != null && (
            <p>Your average energy is {patterns.overall.energy}</p>
          )}
          {patterns.overall.sleep != null && (
            <p>Your average sleep is {patterns.overall.sleep}</p>
          )}
        </div>
      )}

      {checkins.length === 0 ? (
        <p className="text-sm text-gray-500">No check-ins yet.</p>
      ) : (
        <table className="w-full text-sm" aria-label="Check-in history">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Mood</th>
              <th className="py-2 pr-4">Energy</th>
              <th className="py-2">Sleep</th>
            </tr>
          </thead>
          <tbody>
            {checkins.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 pr-4">{formatDate(c.date)}</td>
                <td className="py-2 pr-4">{valueLabel(c.mood)}</td>
                <td className="py-2 pr-4">{valueLabel(c.energy)}</td>
                <td className="py-2">{valueLabel(c.sleep)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
