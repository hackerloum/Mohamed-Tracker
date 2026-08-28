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
import type { HabitEntry } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readBoolean, readIso, readNumber, readString, readStringOrNull } from "./parse";
import { userCollectionPath } from "./paths";

function parseEntry(id: string, data: Record<string, unknown>): HabitEntry {
  return {
    id,
    userId: readString(data, "userId"),
    habitId: readString(data, "habitId"),
    localDate: readString(data, "localDate"),
    timezone: readString(data, "timezone"),
    count: readNumber(data, "count"),
    completed: readBoolean(data, "completed"),
    completedAt: readStringOrNull(data, "completedAt"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function entriesCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, "habitEntries"));
}

export function subscribeHabitEntriesForDate(
  userId: string,
  localDate: string,
  onChange: (entries: HabitEntry[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(entriesCol(userId), where("localDate", "==", localDate));
  return onSnapshot(
    q,
    (snap) =>
      onChange(snap.docs.map((item) => parseEntry(item.id, asRecord(item.data())))),
    (error) => onError(error),
  );
}

export async function listHabitEntriesInRange(
  userId: string,
  start: string,
  end: string,
): Promise<HabitEntry[]> {
  const q = query(
    entriesCol(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => parseEntry(item.id, asRecord(item.data())));
}

export async function writeHabitEntry(entry: HabitEntry): Promise<void> {
  await setDoc(doc(entriesCol(entry.userId), entry.id), {
    userId: entry.userId,
    habitId: entry.habitId,
    localDate: entry.localDate,
    timezone: entry.timezone,
    count: entry.count,
    completed: entry.completed,
    createdAt: entry.createdAt,
    updatedAt: nowIso(),
  });
}

import { deleteSubDoc, getSubDoc, listSubDocs, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

export const habitEntriesRepository: DatedRepository<HabitEntry> = {
  get: (userId, id) => getSubDoc<HabitEntry>(userId, "habitEntries", id),
  list: (userId) => listSubDocs<HabitEntry>(userId, "habitEntries"),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<HabitEntry>(userId, "habitEntries", whereLocalDate(localDate)),
  upsert: (record) => writeHabitEntry(record),
  remove: (userId, id) => deleteSubDoc(userId, "habitEntries", id),
};
