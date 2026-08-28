import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import type { Scale1to5, SleepEntry } from "@/core/types/sleep";
import type { SleepRepository } from "@/repositories/contracts";
import {
  asMillis,
  asNumber,
  asOptionalString,
  asString,
} from "@/repositories/firestore/codec";

function asQuality(value: unknown): Scale1to5 {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }
  return 3;
}

function fromDoc(id: string, data: Record<string, unknown>): SleepEntry {
  const entry: SleepEntry = {
    id,
    userId: asString(data.userId),
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    bedtime: asString(data.bedtime),
    wakeTime: asString(data.wakeTime),
    durationMinutes: asNumber(data.durationMinutes),
    quality: asQuality(data.quality),
    createdAt: asMillis(data.createdAt),
    updatedAt: asMillis(data.updatedAt),
  };
  const notes = asOptionalString(data.notes);
  if (notes) {
    entry.notes = notes;
  }
  return entry;
}

function toDoc(entry: SleepEntry): Record<string, unknown> {
  return {
    id: entry.id,
    userId: entry.userId,
    localDate: entry.localDate,
    timezone: entry.timezone,
    bedtime: entry.bedtime,
    wakeTime: entry.wakeTime,
    durationMinutes: entry.durationMinutes,
    quality: entry.quality,
    notes: entry.notes ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function createFirestoreSleepRepository(db: Firestore): SleepRepository {
  const col = (userId: string) => collection(db, "users", userId, "sleep");

  return {
    async upsert(entry) {
      await setDoc(doc(col(entry.userId), entry.id), toDoc(entry));
      return entry;
    },
    async get(userId, id) {
      const snapshot = await getDoc(doc(col(userId), id));
      if (!snapshot.exists()) {
        return null;
      }
      return fromDoc(snapshot.id, snapshot.data());
    },
    async findByDate(userId, localDate) {
      const snapshot = await getDocs(
        query(col(userId), where("localDate", "==", localDate)),
      );
      const first = snapshot.docs[0];
      return first ? fromDoc(first.id, first.data()) : null;
    },
    async listInRange(userId, start, end) {
      const snapshot = await getDocs(
        query(
          col(userId),
          where("localDate", ">=", start),
          where("localDate", "<=", end),
          orderBy("localDate", "asc"),
        ),
      );
      return snapshot.docs.map((document) => fromDoc(document.id, document.data()));
    },
  };
}
