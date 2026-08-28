import { describe, expect, it } from "vitest";
import { calendarMonth, dayTone } from "./month";

describe("dayTone", () => {
  it("classifies empty, low, strong, and completed days from stored scores", () => {
    expect(dayTone(null)).toBe("empty");
    expect(dayTone(20)).toBe("low");
    expect(dayTone(75)).toBe("strong");
    expect(dayTone(100)).toBe("completed");
  });
});

describe("calendarMonth", () => {
  it("builds a Monday-start grid for August 2026 with spend intensity", () => {
    const cells = calendarMonth({
      monthStart: "2026-08-01",
      scores: { "2026-08-03": 100, "2026-08-04": 22, "2026-08-05": 80 },
      spend: { "2026-08-03": 10000, "2026-08-05": 40000 },
    });
    expect(cells[0]?.localDate).toBe("2026-07-27");
    expect(cells[0]?.inMonth).toBe(false);
    const third = cells.find((cell) => cell.localDate === "2026-08-03");
    const fourth = cells.find((cell) => cell.localDate === "2026-08-04");
    const fifth = cells.find((cell) => cell.localDate === "2026-08-05");
    expect(third?.tone).toBe("completed");
    expect(fourth?.tone).toBe("low");
    expect(fifth?.tone).toBe("strong");
    expect(fifth?.spendIntensity).toBe(1);
    expect(third?.spendIntensity).toBe(0.25);
  });
});
