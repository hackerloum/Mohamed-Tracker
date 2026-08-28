import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";
import {
  type PrayerEntry,
  type PrayerKey,
  CANONICAL_PRAYERS,
  EXTRA_PRAYERS,
} from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readBoolean, readIso, readString, readStringOrNull } from "./parse";
import { userCollectionPath } from "./paths";

function isPrayerKey(value: string): value is PrayerKey {
  return (CANONICAL_PRAYERS as readonly string[]).includes(value)
    || (EXTRA_PRAYERS as readonly string[]).includes(value);
}

function parsePrayer(id: string, data: Record<string, unknown>): PrayerEntry | null {
  const prayerKey = readString(data, "prayerKey");
  if (!isPrayerKey(prayerKey)) return null;
  return {
    id,
    userId: readString(data, "userId"),
    prayerKey,
    prayer: prayerKey,
    localDate: readString(data, "localDate"),
    timezone: readString(data, "timezone"),
    completed: readBoolean(data, "completed"),
    status: readBoolean(data, "completed") ? "on_time" : "unlogged",
    note: readStringOrNull(data, "note"),
    loggedAt: readStringOrNull(data, "loggedAt"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function prayersCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, "prayerEntries"));
}

export function subscribePrayerEntriesForDate(
  userId: string,
  localDate: string,
  onChange: (entries: PrayerEntry[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(prayersCol(userId), where("localDate", "==", localDate));
  return onSnapshot(
    q,
    (snap) => {
      const entries: PrayerEntry[] = [];
      for (const item of snap.docs) {
        const parsed = parsePrayer(item.id, asRecord(item.data()));
        if (parsed) entries.push(parsed);
      }
      onChange(entries);
    },
    (error) => onError(error),
  );
}

export async function listPrayerEntriesInRange(
  userId: string,
  start: string,
  end: string,
): Promise<PrayerEntry[]> {
  const q = query(
    prayersCol(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
  );
  const snap = await getDocs(q);
  const entries: PrayerEntry[] = [];
  for (const item of snap.docs) {
    const parsed = parsePrayer(item.id, asRecord(item.data()));
    if (parsed) entries.push(parsed);
  }
  return entries;
}

export async function writePrayerEntry(entry: PrayerEntry): Promise<void> {
  await setDoc(doc(prayersCol(entry.userId), entry.id), {
    userId: entry.userId,
    prayerKey: entry.prayerKey,
    localDate: entry.localDate,
    timezone: entry.timezone,
    completed: entry.completed,
    note: entry.note,
    createdAt: entry.createdAt,
    updatedAt: nowIso(),
  });
}
