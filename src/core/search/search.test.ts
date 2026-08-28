import { describe, expect, it } from "vitest";
import { searchDocuments, type SearchDocument } from "./search";

const docs: SearchDocument[] = [
  {
    id: "w1",
    kind: "activity",
    title: "Gym",
    detail: "Workout · 45 min",
    haystack: "workout gym 45",
    localDate: "2026-08-28",
    href: "/log",
  },
  {
    id: "t1",
    kind: "transaction",
    title: "TZS 50,000",
    detail: "Food · lunch",
    haystack: "expense food lunch 50000 50,000",
    localDate: "2026-08-27",
    href: "/money",
  },
  {
    id: "n1",
    kind: "note",
    title: "Cybersecurity reading",
    detail: "OWASP notes",
    haystack: "note cybersecurity owasp reading",
    localDate: "2026-08-26",
    href: "/log",
  },
  {
    id: "p1",
    kind: "prayer",
    title: "Fajr",
    detail: "On time",
    haystack: "prayer fajr on_time",
    localDate: "2026-08-28",
    href: "/today",
  },
  {
    id: "s1",
    kind: "study",
    title: "Cybersecurity",
    detail: "90 min",
    haystack: "study cybersecurity 90",
    localDate: "2026-08-25",
    href: "/study",
  },
  {
    id: "h1",
    kind: "habit",
    title: "Read",
    detail: "Daily habit",
    haystack: "habit read",
    localDate: "2026-08-28",
    href: "/more/habits",
  },
];

describe("searchDocuments", () => {
  it("returns nothing for a blank query", () => {
    expect(searchDocuments("   ", docs)).toEqual([]);
  });

  it("finds gym, food, 50000, cybersecurity, and Fajr", () => {
    expect(searchDocuments("gym", docs).map((row) => row.id)).toEqual(["w1"]);
    expect(searchDocuments("food", docs).map((row) => row.id)).toEqual(["t1"]);
    expect(searchDocuments("50000", docs).map((row) => row.id)).toEqual(["t1"]);
    expect(searchDocuments("cybersecurity", docs).map((row) => row.id)).toEqual(["n1", "s1"]);
    expect(searchDocuments("Fajr", docs).map((row) => row.id)).toEqual(["p1"]);
  });

  it("requires every token to match", () => {
    expect(searchDocuments("cybersecurity 90", docs).map((row) => row.id)).toEqual(["s1"]);
  });
});
