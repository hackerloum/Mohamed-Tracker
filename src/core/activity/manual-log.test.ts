import { describe, expect, it } from "vitest";
import { hrefForManualLogKind } from "./mapping";

describe("hrefForManualLogKind", () => {
  it("deep-links types owned by other waves", () => {
    expect(hrefForManualLogKind("expense")).toBe("/money?add=expense");
    expect(hrefForManualLogKind("income")).toBe("/money?add=income");
    expect(hrefForManualLogKind("prayer")).toBe("/today?quick=prayer");
    expect(hrefForManualLogKind("task")).toBe("/today?quick=task");
    expect(hrefForManualLogKind("habit")).toBe("/today?quick=habit");
    expect(hrefForManualLogKind("mood")).toBe("/today/reflection");
  });

  it("keeps Wave D types in-sheet or on their routes", () => {
    expect(hrefForManualLogKind("study")).toBe("/study/start");
    expect(hrefForManualLogKind("workout")).toBe("/workout");
    expect(hrefForManualLogKind("note")).toBeNull();
    expect(hrefForManualLogKind("activity")).toBeNull();
    expect(hrefForManualLogKind("custom")).toBeNull();
  });
});
