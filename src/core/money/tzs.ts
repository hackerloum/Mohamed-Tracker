import type { TzsAmount } from "../types/common";

export type { TzsAmount };

export function assertTzs(amount: number): TzsAmount {
  if (!Number.isInteger(amount)) {
    throw new Error("TZS amounts must be integers (shillings), never floats.");
  }
  return amount;
}

export function addTzs(a: TzsAmount, b: TzsAmount): TzsAmount {
  return assertTzs(assertTzs(a) + assertTzs(b));
}

export function subtractTzs(a: TzsAmount, b: TzsAmount): TzsAmount {
  return assertTzs(assertTzs(a) - assertTzs(b));
}

export function formatTzs(amount: TzsAmount, locale = "en-TZ"): string {
  assertTzs(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function parseTzsInput(raw: string): TzsAmount | null {
  if (/[.]/.test(raw)) return null;
  const cleaned = raw.replace(/[^\d-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const parsed = Number(cleaned);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}
