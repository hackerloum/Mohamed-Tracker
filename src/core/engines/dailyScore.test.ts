import { describe, expect, it } from "vitest";
import { computeDailyScore } from "./dailyScore";

describe("computeDailyScore", () => {
  it("returns null when there is nothing to score", () => {
    const result = computeDailyScore({
      habits: [],
      prayersCompleted: 0,
      prayerTotal: 0,
      planned: false,
      includePlan: false,
      tasksCompleted: 0,
      tasksTotal: 0,
    });

    expect(result.score).toBeNull();
    expect(result.breakdown).toEqual({
      habits: null,
      prayer: null,
      plan: null,
      tasks: null,
    });
  });

  it("gives partial habit credit from tap counts vs targets", () => {
    const result = computeDailyScore({
      habits: [
        { count: 1, targetCount: 1 },
        { count: 1, targetCount: 2 },
      ],
      prayersCompleted: 0,
      prayerTotal: 0,
      planned: false,
      includePlan: false,
      tasksCompleted: 0,
      tasksTotal: 0,
    });

    expect(result.breakdown.habits).toBe(75);
    expect(result.score).toBe(75);
  });

  it("scores canonical prayers out of the provided total and ignores empty task lists", () => {
    const result = computeDailyScore({
      habits: [],
      prayersCompleted: 3,
      prayerTotal: 5,
      planned: true,
      includePlan: true,
      tasksCompleted: 0,
      tasksTotal: 0,
    });

    expect(result.breakdown.prayer).toBe(60);
    expect(result.breakdown.plan).toBe(100);
    expect(result.breakdown.tasks).toBeNull();
    expect(result.score).toBe(73);
  });

  it("renormalizes custom weights across components that have data", () => {
    const result = computeDailyScore({
      habits: [{ count: 1, targetCount: 1 }],
      prayersCompleted: 5,
      prayerTotal: 5,
      planned: false,
      includePlan: true,
      tasksCompleted: 1,
      tasksTotal: 2,
          weights: { habits: 40, prayer: 30, plan: 15, tasks: 15, study: 0, workout: 0, reflection: 0 },
    });

    expect(result.breakdown.habits).toBe(100);
    expect(result.breakdown.prayer).toBe(100);
    expect(result.breakdown.plan).toBe(0);
    expect(result.breakdown.tasks).toBe(50);
    expect(result.score).toBe(78);
  });
});
