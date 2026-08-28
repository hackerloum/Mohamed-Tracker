import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

export function toTimestamp(value: Date): Timestamp {
  return Timestamp.fromDate(value);
}

export function fromTimestamp(value: unknown, fallback: Date): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return fallback;
}

export function omitUndefined(
  data: Record<string, unknown>,
): DocumentData {
  const out: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function snapshotData(
  snap: QueryDocumentSnapshot,
): DocumentData {
  return snap.data();
}
