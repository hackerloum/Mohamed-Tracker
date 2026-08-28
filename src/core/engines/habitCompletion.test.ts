import { describe, expect, it } from "vitest";
import { applyHabitTap } from "./habitCompletion";

describe("applyHabitTap", () => {
  it("completes a target-1 habit on the first tap", () => {
    expect(applyHabitTap(0, 1)).toEqual({ count: 1, completed: true });
  });

  it("takes three taps to complete a target-3 habit", () => {
    expect(applyHabitTap(0, 3)).toEqual({ count: 1, completed: false });
    expect(applyHabitTap(1, 3)).toEqual({ count: 2, completed: false });
    expect(applyHabitTap(2, 3)).toEqual({ count: 3, completed: true });
  });

  it("does not increment past the target", () => {
    expect(applyHabitTap(3, 3)).toEqual({ count: 3, completed: true });
    expect(applyHabitTap(1, 1)).toEqual({ count: 1, completed: true });
  });

  it("treats a missing entry as count 0", () => {
    expect(applyHabitTap(null, 2)).toEqual({ count: 1, completed: false });
  });
});
