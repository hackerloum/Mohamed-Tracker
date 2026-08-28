import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { DayRecord } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import {
  readBoolean,
  readIso,
  readNumber,
  readString,
  readStringArray,
  readStringOrNull,
  asRecord,
} from "./parse";
import { userCollectionPath } from "./paths";

function parseDay(id: string, data: Record<string, unknown>): DayRecord {
  const cached = readNumber(data, "cachedScore", Number.NaN);
  return {
    id,
    userId: readString(data, "userId"),
    localDate: readString(data, "localDate", id),
    timezone: readString(data, "timezone"),
    planned: readBoolean(data, "planned"),
    priorityTaskIds: readStringArray(data, "priorityTaskIds"),
    cachedScore: Number.isFinite(cached) ? cached : null,
    notes: readStringOrNull(data, "notes"),
    stageNotes: {},
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function dayRef(userId: string, localDate: string) {
  return doc(requireDb(), userCollectionPath(userId, "days"), localDate);
}

export async function listDaysInRange(
  userId: string,
  start: string,
  end: string,
): Promise<DayRecord[]> {
  const q = query(
    collection(requireDb(), userCollectionPath(userId, "days")),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => parseDay(item.id, asRecord(item.data())));
}

export function subscribeDay(
  userId: string,
  localDate: string,
  onChange: (day: DayRecord | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dayRef(userId, localDate),
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange(parseDay(snap.id, asRecord(snap.data())));
    },
    (error) => onError(error),
  );
}

export async function writeDay(day: DayRecord): Promise<void> {
  await setDoc(dayRef(day.userId, day.localDate), {
    userId: day.userId,
    localDate: day.localDate,
    timezone: day.timezone,
    planned: day.planned,
    priorityTaskIds: day.priorityTaskIds,
    cachedScore: day.cachedScore,
    notes: day.notes,
    createdAt: day.createdAt,
    updatedAt: nowIso(),
  });
}

import { deleteSubDoc, getSubDoc, listSubDocs, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

export const daysRepository: DatedRepository<DayRecord> = {
  get: (userId, id) => getSubDoc<DayRecord>(userId, "days", id),
  list: (userId) => listSubDocs<DayRecord>(userId, "days"),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<DayRecord>(userId, "days", whereLocalDate(localDate)),
  upsert: (record) => writeDay(record),
  remove: (userId, id) => deleteSubDoc(userId, "days", id),
};
