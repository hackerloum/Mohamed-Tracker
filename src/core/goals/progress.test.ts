import { describe, expect, it } from "vitest";
import { goalProgressPercent } from "./progress";

describe("goalProgressPercent", () => {
  it("returns 50 for an amount goal at half the target", () => {
    expect(
      goalProgressPercent({ type: "amount", target: 5_000_000, current: 2_500_000 }),
    ).toBe(50);
  });

  it("returns 25 for a count goal", () => {
    expect(goalProgressPercent({ type: "count", target: 12, current: 3 })).toBe(25);
  });

  it("returns 50 for a duration goal in minutes", () => {
    expect(
      goalProgressPercent({ type: "duration", target: 6_000, current: 3_000 }),
    ).toBe(50);
  });

  it("treats percentage goals as current out of target", () => {
    expect(
      goalProgressPercent({ type: "percentage", target: 100, current: 80 }),
    ).toBe(80);
  });

  it("treats manual progress as a 0–100 value", () => {
    expect(goalProgressPercent({ type: "manual", target: 100, current: 40 })).toBe(
      40,
    );
  });

  it("clamps completed work at 100", () => {
    expect(
      goalProgressPercent({ type: "count", target: 10, current: 18 }),
    ).toBe(100);
  });

  it("returns 0 when the target is zero", () => {
    expect(goalProgressPercent({ type: "amount", target: 0, current: 10 })).toBe(0);
  });

  it("returns 0 when current is negative", () => {
    expect(goalProgressPercent({ type: "count", target: 10, current: -4 })).toBe(0);
  });

  it("rounds to the nearest percent", () => {
    expect(goalProgressPercent({ type: "count", target: 3, current: 1 })).toBe(33);
  });
});
