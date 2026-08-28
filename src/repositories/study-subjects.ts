import { addDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import type { StudySubject } from "@/core/types/study";
import { getDb } from "@/lib/firebase/firestore";
import { userCollection } from "@/lib/firebase/paths";
import { asBoolean, asIso, asString, isoNow } from "./convert";

export function createStudySubject(
  userId: string,
  name: string,
): Promise<StudySubject> {
  const now = isoNow();
  const payload = { userId, name, archived: false, createdAt: now, updatedAt: now };
  return addDoc(userCollection(getDb(), userId, "studySubjects"), payload).then(
    (ref) => ({ ...payload, id: ref.id }),
  );
}

export function subscribeStudySubjects(
  userId: string,
  onChange: (subjects: StudySubject[]) => void,
): Unsubscribe {
  return onSnapshot(userCollection(getDb(), userId, "studySubjects"), (snap) => {
    const subjects = snap.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const createdAt = asIso(data.createdAt, isoNow());
        return {
          id: docSnap.id,
          userId: asString(data.userId),
          createdAt,
          updatedAt: asIso(data.updatedAt, createdAt),
          name: asString(data.name),
          archived: asBoolean(data.archived),
        };
      })
      .filter((subject) => !subject.archived)
      .sort((a, b) => a.name.localeCompare(b.name));
    onChange(subjects);
  });
}
