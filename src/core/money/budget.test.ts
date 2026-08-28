import { describe, expect, it } from "vitest";
import { budgetProgressCopy, percentUsed } from "./budget";

describe("percentUsed", () => {
  it("rounds to a whole percent using integer math", () => {
    expect(percentUsed(116000, 200000)).toBe(58);
    expect(percentUsed(0, 200000)).toBe(0);
    expect(percentUsed(200000, 200000)).toBe(100);
    expect(percentUsed(240000, 200000)).toBe(120);
  });

  it("returns null when no budget is set", () => {
    expect(percentUsed(5000, 0)).toBeNull();
    expect(percentUsed(0, 0)).toBeNull();
  });

  it("rejects non-integer inputs", () => {
    expect(() => percentUsed(1.5, 100)).toThrow(/integer/i);
  });
});

describe("budgetProgressCopy", () => {
  it("names a category budget", () => {
    expect(
      budgetProgressCopy({
        spent: 116000,
        limit: 200000,
        label: "Food",
      }),
    ).toBe("You've used 58% of your Food budget.");
  });

  it("names the overall budget", () => {
    expect(
      budgetProgressCopy({
        spent: 348000,
        limit: 600000,
        label: "overall",
      }),
    ).toBe("You've used 58% of your overall budget.");
  });

  it("stays honest when over budget", () => {
    expect(
      budgetProgressCopy({
        spent: 250000,
        limit: 200000,
        label: "Food",
      }),
    ).toBe("You've used 125% of your Food budget.");
  });

  it("says when a budget is missing", () => {
    expect(
      budgetProgressCopy({
        spent: 1000,
        limit: 0,
        label: "Transport",
      }),
    ).toBe("No Transport budget set.");
  });
});
