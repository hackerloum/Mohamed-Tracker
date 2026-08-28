import { collection, doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import type { Reflection, ReflectionMode } from "@/core/types/reflection";
import { REFLECTION_MODES } from "@/core/types/reflection";
import type { ReflectionRepository } from "@/repositories/contracts";
import {
  asMillis,
  asNumber,
  asOptionalString,
  asString,
} from "@/repositories/firestore/codec";

function isMode(value: string): value is ReflectionMode {
  return (REFLECTION_MODES as readonly string[]).includes(value);
}

function fromDoc(id: string, data: Record<string, unknown>): Reflection | null {
  const modeRaw = asString(data.mode);
  if (!isMode(modeRaw)) {
    return null;
  }

  const reflection: Reflection = {
    id,
    userId: asString(data.userId),
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    mode: modeRaw,
    createdAt: asMillis(data.createdAt),
    updatedAt: asMillis(data.updatedAt),
  };

  const wentWell = asOptionalString(data.wentWell);
  if (wentWell) reflection.wentWell = wentWell;
  const couldBeBetter = asOptionalString(data.couldBeBetter);
  if (couldBeBetter) reflection.couldBeBetter = couldBeBetter;
  const learned = asOptionalString(data.learned);
  if (learned) reflection.learned = learned;
  const gratefulFor = asOptionalString(data.gratefulFor);
  if (gratefulFor) reflection.gratefulFor = gratefulFor;
  const anythingElse = asOptionalString(data.anythingElse);
  if (anythingElse) reflection.anythingElse = anythingElse;
  const mainWin = asOptionalString(data.mainWin);
  if (mainWin) reflection.mainWin = mainWin;
  const improveTomorrow = asOptionalString(data.improveTomorrow);
  if (improveTomorrow) reflection.improveTomorrow = improveTomorrow;
  const dayRating = asNumber(data.dayRating, 0);
  if (dayRating >= 1 && dayRating <= 10) {
    reflection.dayRating = dayRating;
  }

  return reflection;
}

export function createFirestoreReflectionRepository(
  db: Firestore,
): ReflectionRepository {
  const col = (userId: string) => collection(db, "users", userId, "reflections");

  return {
    async upsert(reflection) {
      await setDoc(doc(col(reflection.userId), reflection.id), { ...reflection });
      return reflection;
    },
    async getByDate(userId, localDate) {
      const snapshot = await getDoc(doc(col(userId), localDate));
      if (!snapshot.exists()) {
        return null;
      }
      return fromDoc(snapshot.id, snapshot.data());
    },
  };
}
