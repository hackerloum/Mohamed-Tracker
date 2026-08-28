import { isDateInRange, weekWindow } from "@/core/dates/localDate";

const TIME = /^(\d{1,2}):([0-5]\d)$/;

function parseMinutes(value: string): number {
  const match = TIME.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time: ${value}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) {
    throw new Error(`Invalid time: ${value}`);
  }

  return hours * 60 + minutes;
}

export function sleepDurationMinutes(bedtime: string, wakeTime: string): number {
  const bed = parseMinutes(bedtime);
  const wake = parseMinutes(wakeTime);
  const elapsed = wake - bed;
  if (elapsed < 0) {
    return elapsed + 24 * 60;
  }
  return elapsed;
}

export function weeklyAverageMinutes(
  entries: readonly { localDate: string; durationMinutes: number }[],
  endDate: string,
): number | null {
  const { start, end } = weekWindow(endDate);
  const week = entries.filter((entry) =>
    isDateInRange(entry.localDate, start, end),
  );

  if (week.length === 0) {
    return null;
  }

  const total = week.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  return Math.round(total / week.length);
}

export function formatDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest}m`;
  }
  if (rest === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${rest}m`;
}
