import { Timestamp } from "firebase/firestore";

export function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return new Date().toISOString();
}

export function nowIso(): string {
  return new Date().toISOString();
}
