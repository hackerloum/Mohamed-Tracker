import { describe, expect, it } from "vitest";
import {
  addTzs,
  appendKeypadDigit,
  backspaceKeypad,
  formatTzs,
  parseKeypadDigits,
  subtractTzs,
} from "./integer";

describe("integer TZS arithmetic", () => {
  it("adds whole shillings", () => {
    expect(addTzs(25000, 1500)).toBe(26500);
  });

  it("subtracts whole shillings", () => {
    expect(subtractTzs(600000, 125000)).toBe(475000);
  });

  it("rejects non-integers", () => {
    expect(() => addTzs(10.5, 1)).toThrow(/integer/i);
    expect(() => subtractTzs(10, 1.2)).toThrow(/integer/i);
  });

  it("formats with thousand separators and no decimals", () => {
    expect(formatTzs(25000)).toBe("25,000");
    expect(formatTzs(0)).toBe("0");
    expect(formatTzs(600000, { withCode: true })).toBe("TZS 600,000");
  });

  it("parses keypad digit strings as integers", () => {
    expect(parseKeypadDigits("")).toBe(0);
    expect(parseKeypadDigits("25000")).toBe(25000);
    expect(parseKeypadDigits("00040")).toBe(40);
  });

  it("rejects decimal keypad input", () => {
    expect(() => parseKeypadDigits("12.5")).toThrow(/integer/i);
    expect(() => parseKeypadDigits("12,5")).toThrow(/integer/i);
  });
});

describe("keypad digit buffer", () => {
  it("appends digits and ignores leading zeros after empty", () => {
    expect(appendKeypadDigit("", "0")).toBe("0");
    expect(appendKeypadDigit("0", "5")).toBe("5");
    expect(appendKeypadDigit("25", "0")).toBe("250");
  });

  it("caps length so amounts stay in safe integer range", () => {
    const twelve = "9".repeat(12);
    expect(appendKeypadDigit(twelve, "1")).toBe(twelve);
  });

  it("ignores non-digit taps", () => {
    expect(appendKeypadDigit("12", ".")).toBe("12");
    expect(appendKeypadDigit("12", "a")).toBe("12");
  });

  it("backspaces to empty", () => {
    expect(backspaceKeypad("250")).toBe("25");
    expect(backspaceKeypad("2")).toBe("");
    expect(backspaceKeypad("")).toBe("");
  });
});
