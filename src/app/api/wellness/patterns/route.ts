import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const checkins = await prisma.wellnessCheckin.findMany({
    where: {
      userId: session.user.id,
      date: { gte: since },
    },
    orderBy: { date: "asc" },
  });

  // Overall averages
  let moodSum = 0,
    moodCount = 0;
  let energySum = 0,
    energyCount = 0;
  let sleepSum = 0,
    sleepCount = 0;

  // Per-day-of-week buckets
  const dayBuckets: Record<
    string,
    { mood: number[]; energy: number[]; sleep: number[] }
  > = {};
  for (const name of DAY_NAMES) {
    dayBuckets[name] = { mood: [], energy: [], sleep: [] };
  }

  for (const c of checkins) {
    const dayName = DAY_NAMES[new Date(c.date).getUTCDay()];

    if (c.mood != null) {
      moodSum += c.mood;
      moodCount++;
      dayBuckets[dayName].mood.push(c.mood);
    }
    if (c.energy != null) {
      energySum += c.energy;
      energyCount++;
      dayBuckets[dayName].energy.push(c.energy);
    }
    if (c.sleep != null) {
      sleepSum += c.sleep;
      sleepCount++;
      dayBuckets[dayName].sleep.push(c.sleep);
    }
  }

  const avg = (sum: number, count: number) =>
    count > 0 ? Math.round((sum / count) * 10) / 10 : null;

  const avgArr = (arr: number[]) =>
    arr.length > 0
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      : null;

  const overall = {
    mood: avg(moodSum, moodCount),
    energy: avg(energySum, energyCount),
    sleep: avg(sleepSum, sleepCount),
    totalCheckins: checkins.length,
  };

  const byDayOfWeek: Record<
    string,
    { mood: number | null; energy: number | null; sleep: number | null }
  > = {};
  for (const name of DAY_NAMES) {
    byDayOfWeek[name] = {
      mood: avgArr(dayBuckets[name].mood),
      energy: avgArr(dayBuckets[name].energy),
      sleep: avgArr(dayBuckets[name].sleep),
    };
  }

  return NextResponse.json({ overall, byDayOfWeek });
}
