import { describe, expect, it } from "vitest";
import { sleepDurationMinutes, weeklyAverageMinutes } from "./duration";

describe("sleepDurationMinutes", () => {
  it("calculates overnight sleep from 23:00 to 06:30", () => {
    expect(sleepDurationMinutes("23:00", "06:30")).toBe(450);
  });

  it("calculates overnight sleep from 23:00 to 07:00", () => {
    expect(sleepDurationMinutes("23:00", "07:00")).toBe(480);
  });

  it("calculates same-day rest from 14:00 to 15:30", () => {
    expect(sleepDurationMinutes("14:00", "15:30")).toBe(90);
  });

  it("treats identical bedtime and wake as zero minutes", () => {
    expect(sleepDurationMinutes("07:00", "07:00")).toBe(0);
  });

  it("handles a minute across midnight", () => {
    expect(sleepDurationMinutes("23:59", "00:00")).toBe(1);
  });

  it("accepts single-digit hours", () => {
    expect(sleepDurationMinutes("22:05", "6:05")).toBe(480);
  });

  it("throws on an invalid time", () => {
    expect(() => sleepDurationMinutes("25:00", "07:00")).toThrow(/invalid time/i);
  });
});

describe("weeklyAverageMinutes", () => {
  it("averages durations in the inclusive 7-day window", () => {
    const average = weeklyAverageMinutes(
      [
        { localDate: "2026-08-22", durationMinutes: 400 },
        { localDate: "2026-08-24", durationMinutes: 500 },
        { localDate: "2026-08-28", durationMinutes: 300 },
        { localDate: "2026-08-21", durationMinutes: 999 },
      ],
      "2026-08-28",
    );

    expect(average).toBe(400);
  });

  it("returns null when the week has no entries", () => {
    expect(weeklyAverageMinutes([], "2026-08-28")).toBeNull();
  });

  it("ignores entries after the window end", () => {
    expect(
      weeklyAverageMinutes(
        [{ localDate: "2026-08-29", durationMinutes: 600 }],
        "2026-08-28",
      ),
    ).toBeNull();
  });
});
