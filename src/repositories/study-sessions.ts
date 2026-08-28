import {
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { StudySession } from "@/core/types/study";
import { getDb } from "@/lib/firebase/firestore";
import { userCollection } from "@/lib/firebase/paths";
import { asIso, asNullableString, asNumber, asString, isoNow } from "./convert";

export type StudySessionWrite = Omit<StudySession, "id" | "createdAt" | "updatedAt">;

export function createStudySession(
  input: StudySessionWrite,
): Promise<StudySession> {
  const now = isoNow();
  const payload = { ...input, createdAt: now, updatedAt: now };
  return addDoc(userCollection(getDb(), input.userId, "studySessions"), payload).then(
    (ref) => ({ ...payload, id: ref.id }),
  );
}

export function subscribeStudySessions(
  userId: string,
  from: string,
  to: string,
  onChange: (sessions: StudySession[]) => void,
): Unsubscribe {
  const q = query(
    userCollection(getDb(), userId, "studySessions"),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((docSnap) => toStudySession(docSnap.id, docSnap.data())));
  });
}

export async function listStudySessionsInRange(
  userId: string,
  from: string,
  to: string,
): Promise<StudySession[]> {
  const q = query(
    userCollection(getDb(), userId, "studySessions"),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => toStudySession(docSnap.id, docSnap.data()));
}

function toStudySession(id: string, data: DocumentData): StudySession {
  const createdAt = asIso(data.createdAt, isoNow());
  return {
    id,
    userId: asString(data.userId),
    createdAt,
    updatedAt: asIso(data.updatedAt, createdAt),
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    subjectId: asNullableString(data.subjectId),
    topic: asString(data.topic),
    notes: asNullableString(data.notes),
    startedAt: asIso(data.startedAt, createdAt),
    endedAt: asIso(data.endedAt, createdAt),
    durationMinutes: asNumber(data.durationMinutes),
  };
}
