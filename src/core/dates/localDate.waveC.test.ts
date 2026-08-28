import { describe, expect, it } from "vitest";
import {
  addLocalDays,
  localDateKey,
  monthRange,
  weekRange,
} from "./localDate";

const TZ = "Africa/Dar_es_Salaam";

describe("localDateKey", () => {
  it("uses the IANA timezone, not UTC", () => {
    const utcLate = new Date("2026-08-27T22:30:00.000Z");
    expect(localDateKey(utcLate, TZ)).toBe("2026-08-28");
  });
});

describe("ranges", () => {
  it("returns a Monday–Sunday week in local time", () => {
    const friday = new Date("2026-08-28T08:00:00+03:00");
    expect(weekRange(friday, TZ)).toEqual({
      start: "2026-08-24",
      end: "2026-08-30",
    });
  });

  it("returns the calendar month", () => {
    const friday = new Date("2026-08-28T08:00:00+03:00");
    expect(monthRange(friday, TZ)).toEqual({
      start: "2026-08-01",
      end: "2026-08-31",
    });
  });

  it("adds whole local days", () => {
    expect(addLocalDays("2026-08-28", 1)).toBe("2026-08-29");
    expect(addLocalDays("2026-08-31", 1)).toBe("2026-09-01");
  });
});
