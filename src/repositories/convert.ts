import { Timestamp } from "firebase/firestore";
import type { IsoDateTime } from "@/core/types/common";

export function isoNow(): IsoDateTime {
  return new Date().toISOString();
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function asIso(value: unknown, fallback: IsoDateTime): IsoDateTime {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return fallback;
}

export function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "string" ? value : null;
}
