import { describe, expect, it } from "vitest";
import { addTzs, assertTzs, formatTzs, parseTzsInput, subtractTzs } from "./tzs";

describe("tzs helpers", () => {
  it("rejects floats", () => {
    expect(() => assertTzs(10.5)).toThrow(/integers/);
  });

  it("adds and subtracts integers only", () => {
    expect(addTzs(2500, 500)).toBe(3000);
    expect(subtractTzs(2500, 500)).toBe(2000);
  });

  it("parses keypad input as integer shillings", () => {
    expect(parseTzsInput("12,000")).toBe(12000);
    expect(parseTzsInput("")).toBeNull();
    expect(parseTzsInput("10.5")).toBeNull();
  });

  it("formats without fraction digits", () => {
    const formatted = formatTzs(1500);
    expect(formatted.includes("1")).toBe(true);
    expect(formatted.includes(".")).toBe(false);
  });
});
