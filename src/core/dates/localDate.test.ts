import { describe, expect, it } from "vitest";
import {
  addLocalDays,
  assertLocalDate,
  dayStage,
  isLocalDate,
  localDate,
  monthKey,
} from "./localDate";

describe("localDate", () => {
  it("formats a known instant in Africa/Dar_es_Salaam", () => {
    const instant = new Date("2026-01-15T21:30:00.000Z");
    expect(localDate(instant, "Africa/Dar_es_Salaam")).toBe("2026-01-16");
  });

  it("rejects invalid calendar dates", () => {
    expect(isLocalDate("2026-13-01")).toBe(false);
    expect(isLocalDate("2026-02-30")).toBe(false);
    expect(() => assertLocalDate("nope")).toThrow(/Invalid local date/);
  });

  it("adds days without using UTC slice", () => {
    expect(addLocalDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addLocalDays("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("derives month keys from local dates", () => {
    expect(monthKey("2026-08-28")).toBe("2026-08");
  });

  it("maps hours to day stages in the given zone", () => {
    expect(dayStage(new Date("2026-08-28T03:00:00.000Z"), "Africa/Dar_es_Salaam")).toBe(
      "morning",
    );
    expect(dayStage(new Date("2026-08-28T12:00:00.000Z"), "Africa/Dar_es_Salaam")).toBe(
      "afternoon",
    );
    expect(dayStage(new Date("2026-08-28T16:00:00.000Z"), "Africa/Dar_es_Salaam")).toBe(
      "evening",
    );
    expect(dayStage(new Date("2026-08-28T19:00:00.000Z"), "Africa/Dar_es_Salaam")).toBe(
      "night",
    );
  });
});
