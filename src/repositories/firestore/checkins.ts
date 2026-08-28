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
import type { CheckIn } from "@/core/types/checkin";
import type { Scale1to5 } from "@/core/types/sleep";
import type { CheckInRepository } from "@/repositories/contracts";
import { asMillis, asString } from "@/repositories/firestore/codec";

function asScale(value: unknown): Scale1to5 | undefined {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }
  return undefined;
}

function fromDoc(id: string, data: Record<string, unknown>): CheckIn {
  const checkIn: CheckIn = {
    id,
    userId: asString(data.userId),
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    createdAt: asMillis(data.createdAt),
    updatedAt: asMillis(data.updatedAt),
  };

  const mood = asScale(data.mood);
  if (mood) checkIn.mood = mood;
  const energy = asScale(data.energy);
  if (energy) checkIn.energy = energy;
  const focus = asScale(data.focus);
  if (focus) checkIn.focus = focus;
  const stress = asScale(data.stress);
  if (stress) checkIn.stress = stress;

  return checkIn;
}

export function createFirestoreCheckInRepository(db: Firestore): CheckInRepository {
  const col = (userId: string) => collection(db, "users", userId, "checkins");

  return {
    async upsert(checkIn) {
      await setDoc(doc(col(checkIn.userId), checkIn.id), { ...checkIn });
      return checkIn;
    },
    async getByDate(userId, localDate) {
      const snapshot = await getDoc(doc(col(userId), localDate));
      if (!snapshot.exists()) {
        return null;
      }
      return fromDoc(snapshot.id, snapshot.data());
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
