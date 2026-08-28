import { toIso } from "@/lib/firebase/timestamps";

export function asRecord(data: object): Record<string, unknown> {
  return data as Record<string, unknown>;
}

export function readString(
  data: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export function readNumber(
  data: Record<string, unknown>,
  key: string,
  fallback = 0,
): number {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readBoolean(
  data: Record<string, unknown>,
  key: string,
  fallback = false,
): boolean {
  const value = data[key];
  return typeof value === "boolean" ? value : fallback;
}

export function readIso(data: Record<string, unknown>, key: string): string {
  return toIso(data[key]);
}

export function readStringOrNull(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : null;
}

export function readStringArray(
  data: Record<string, unknown>,
  key: string,
): string[] {
  const value = data[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
