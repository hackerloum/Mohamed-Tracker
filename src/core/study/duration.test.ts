import { describe, expect, it } from "vitest";
import {
  durationMinutesFromRange,
  formatElapsedClock,
  timerElapsedMs,
} from "./duration";

describe("durationMinutesFromRange", () => {
  it("rounds 25 minutes of study to 25", () => {
    expect(
      durationMinutesFromRange(
        "2026-08-28T08:00:00.000Z",
        "2026-08-28T08:25:00.000Z",
      ),
    ).toBe(25);
  });

  it("rounds 90 seconds up to 2 minutes", () => {
    expect(
      durationMinutesFromRange(
        "2026-08-28T08:00:00.000Z",
        "2026-08-28T08:01:30.000Z",
      ),
    ).toBe(2);
  });

  it("counts sub-minute positive sessions as 1 minute", () => {
    expect(
      durationMinutesFromRange(
        "2026-08-28T08:00:00.000Z",
        "2026-08-28T08:00:20.000Z",
      ),
    ).toBe(1);
  });

  it("returns 0 when end is not after start", () => {
    expect(
      durationMinutesFromRange(
        "2026-08-28T08:00:00.000Z",
        "2026-08-28T08:00:00.000Z",
      ),
    ).toBe(0);
    expect(
      durationMinutesFromRange(
        "2026-08-28T09:00:00.000Z",
        "2026-08-28T08:00:00.000Z",
      ),
    ).toBe(0);
  });
});

describe("timerElapsedMs", () => {
  it("returns accumulated time while paused", () => {
    expect(
      timerElapsedMs({
        status: "paused",
        accumulatedMs: 45_000,
        resumedAt: null,
        nowMs: 1_000_000,
      }),
    ).toBe(45_000);
  });

  it("adds live elapsed time while running", () => {
    expect(
      timerElapsedMs({
        status: "running",
        accumulatedMs: 10_000,
        resumedAt: "2026-08-28T08:00:00.000Z",
        nowMs: Date.parse("2026-08-28T08:00:05.000Z"),
      }),
    ).toBe(15_000);
  });

  it("is 0 when idle", () => {
    expect(
      timerElapsedMs({
        status: "idle",
        accumulatedMs: 99,
        resumedAt: "2026-08-28T08:00:00.000Z",
        nowMs: Date.parse("2026-08-28T09:00:00.000Z"),
      }),
    ).toBe(0);
  });
});

describe("formatElapsedClock", () => {
  it("formats under an hour as mm:ss", () => {
    expect(formatElapsedClock(125_000)).toBe("02:05");
  });

  it("formats an hour and more as h:mm:ss", () => {
    expect(formatElapsedClock(3_661_000)).toBe("1:01:01");
  });
});
