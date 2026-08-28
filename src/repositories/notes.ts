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
import type { Note } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readIso, readString } from "./parse";
import { userCollectionPath } from "./paths";
import { deleteSubDoc, getSubDoc, listSubDocs, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

function parseNote(id: string, data: Record<string, unknown>): Note {
  return {
    id,
    userId: readString(data, "userId"),
    body: readString(data, "body"),
    localDate: readString(data, "localDate"),
    timezone: readString(data, "timezone"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function notesCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, "notes"));
}

export function subscribeNotesForDate(
  userId: string,
  localDate: string,
  onChange: (notes: Note[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(notesCol(userId), where("localDate", "==", localDate));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs
          .map((item) => parseNote(item.id, asRecord(item.data())))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      ),
    (error) => onError(error),
  );
}

export async function listNotesInRange(
  userId: string,
  start: string,
  end: string,
): Promise<Note[]> {
  const q = query(
    notesCol(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => parseNote(item.id, asRecord(item.data())));
}

export async function writeNote(note: Note): Promise<void> {
  await setDoc(doc(notesCol(note.userId), note.id), {
    userId: note.userId,
    body: note.body,
    localDate: note.localDate,
    timezone: note.timezone,
    createdAt: note.createdAt,
    updatedAt: nowIso(),
  });
}

export async function createNote(input: {
  userId: string;
  body: string;
  localDate: string;
  timezone: string;
}): Promise<Note> {
  const timestamp = nowIso();
  const note: Note = {
    id: `${Date.now()}`,
    userId: input.userId,
    body: input.body,
    localDate: input.localDate,
    timezone: input.timezone,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeNote(note);
  return note;
}

export const notesRepository: DatedRepository<Note> = {
  get: (userId, id) => getSubDoc<Note>(userId, "notes", id),
  list: (userId) => listSubDocs<Note>(userId, "notes"),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<Note>(userId, "notes", whereLocalDate(localDate)),
  upsert: (record) => writeNote(record),
  remove: (userId, id) => deleteSubDoc(userId, "notes", id),
};
