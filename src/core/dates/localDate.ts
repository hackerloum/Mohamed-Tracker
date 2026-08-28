import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { addDays as addDaysFns } from "date-fns";
import type { DayStage } from "../types/day";
import type { IanaTimezone, LocalDate, MonthKey } from "../types/common";

export const DEFAULT_TIMEZONE: IanaTimezone = "Africa/Dar_es_Salaam";

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isLocalDate(value: string): value is LocalDate {
  if (!LOCAL_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function assertLocalDate(value: string): LocalDate {
  if (!isLocalDate(value)) {
    throw new Error(`Invalid local date: ${value}`);
  }
  return value;
}

export function localDate(
  date: Date = new Date(),
  timezone: IanaTimezone = DEFAULT_TIMEZONE,
): LocalDate {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function startOfLocalDay(
  dateStr: LocalDate,
  timezone: IanaTimezone = DEFAULT_TIMEZONE,
): Date {
  return fromZonedTime(`${assertLocalDate(dateStr)} 00:00:00`, timezone);
}

export function addLocalDays(dateStr: LocalDate, days: number): LocalDate {
  const noonUtc = new Date(`${assertLocalDate(dateStr)}T12:00:00.000Z`);
  return formatInTimeZone(addDaysFns(noonUtc, days), "UTC", "yyyy-MM-dd");
}

export function monthKey(
  dateOrStr: Date | LocalDate,
  timeZone: IanaTimezone = DEFAULT_TIMEZONE,
): MonthKey {
  if (dateOrStr instanceof Date) {
    return formatInTimeZone(dateOrStr, timeZone, "yyyy-MM");
  }
  return assertLocalDate(dateOrStr).slice(0, 7);
}

export function formatLocalDateHeading(
  dateStr: LocalDate,
  timezone: IanaTimezone = DEFAULT_TIMEZONE,
): string {
  const start = startOfLocalDay(dateStr, timezone);
  return formatInTimeZone(start, timezone, "EEEE, d MMMM yyyy");
}

export function dayStage(
  date: Date = new Date(),
  timezone: IanaTimezone = DEFAULT_TIMEZONE,
): DayStage {
  const hour = Number.parseInt(formatInTimeZone(date, timezone, "H"), 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function nowIso(date: Date = new Date()): string {
  return date.toISOString();
}

export function localDateFrom(now: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): LocalDate {
  return localDate(now, timeZone);
}

export function localHourFrom(now: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): number {
  return Number.parseInt(formatInTimeZone(now, timeZone, "H"), 10);
}

export function dayStageFrom(now: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): DayStage {
  return dayStage(now, timeZone);
}

export function localDateKey(date: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): LocalDate {
  return localDate(date, timeZone);
}

export function toLocalDate(date: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): LocalDate {
  return localDate(date, timeZone);
}

export function todayLocalDate(timeZone: IanaTimezone = DEFAULT_TIMEZONE): LocalDate {
  return localDate(new Date(), timeZone);
}

export function formatLocalDate(date: Date, timeZone: IanaTimezone = DEFAULT_TIMEZONE): LocalDate {
  return localDate(date, timeZone);
}

export function addDays(dateStr: LocalDate, days: number): LocalDate {
  return addLocalDays(dateStr, days);
}

export function weekWindow(endDate: LocalDate): { start: LocalDate; end: LocalDate } {
  return { start: addLocalDays(endDate, -6), end: endDate };
}

export function isDateInRange(value: LocalDate, start: LocalDate, end: LocalDate): boolean {
  return value >= start && value <= end;
}

export function daysInclusive(start: LocalDate, end: LocalDate): number {
  const from = startOfLocalDay(start, "UTC");
  const to = startOfLocalDay(end, "UTC");
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

export function weekRange(
  date: Date,
  timeZone: IanaTimezone = DEFAULT_TIMEZONE,
): { start: LocalDate; end: LocalDate } {
  const key = localDate(date, timeZone);
  const day = Number.parseInt(formatInTimeZone(date, timeZone, "i"), 10);
  const mondayOffset = day - 1;
  const start = addLocalDays(key, -mondayOffset);
  return { start, end: addLocalDays(start, 6) };
}

export function monthRange(
  date: Date,
  timeZone: IanaTimezone = DEFAULT_TIMEZONE,
): { start: LocalDate; end: LocalDate } {
  const start = formatInTimeZone(date, timeZone, "yyyy-MM-01");
  const year = Number.parseInt(start.slice(0, 4), 10);
  const month = Number.parseInt(start.slice(5, 7), 10);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${start.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function yearRange(
  date: Date,
  timeZone: IanaTimezone = DEFAULT_TIMEZONE,
): { start: LocalDate; end: LocalDate } {
  const year = formatInTimeZone(date, timeZone, "yyyy");
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function eachLocalDate(start: LocalDate, end: LocalDate): LocalDate[] {
  const dates: LocalDate[] = [];
  let cursor = assertLocalDate(start);
  const last = assertLocalDate(end);
  while (cursor <= last) {
    dates.push(cursor);
    cursor = addLocalDays(cursor, 1);
  }
  return dates;
}

export function startOfWeekMonday(dateStr: LocalDate): LocalDate {
  const [year, month, day] = assertLocalDate(dateStr).split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  return addLocalDays(dateStr, -daysFromMonday);
}

export function startOfMonthDate(dateStr: LocalDate): LocalDate {
  return `${assertLocalDate(dateStr).slice(0, 7)}-01`;
}

export function monthKeyFromDate(
  date: Date,
  timeZone: IanaTimezone = DEFAULT_TIMEZONE,
): MonthKey {
  return formatInTimeZone(date, timeZone, "yyyy-MM");
}
