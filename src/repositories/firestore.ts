import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/firestore";
import { colPath, docPath, userPath } from "./types";

function converter<T extends { id: string }>() {
  return {
    toFirestore(record: T): DocumentData {
      return { ...record };
    },
    fromFirestore(snapshot: { id: string; data: () => DocumentData }): T {
      return { ...(snapshot.data() as T), id: snapshot.id };
    },
  };
}

export async function getUserDoc<T>(userId: string): Promise<T | null> {
  const snap = await getDoc(doc(getFirestoreDb(), userPath(userId)));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function setUserDoc<T extends object>(userId: string, data: T): Promise<void> {
  await setDoc(doc(getFirestoreDb(), userPath(userId)), data, { merge: true });
}

export async function getSubDoc<T extends { id: string }>(
  userId: string,
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(getFirestoreDb(), docPath(userId, collectionName, id)));
  if (!snap.exists()) return null;
  return { ...(snap.data() as T), id: snap.id };
}

export async function setSubDoc<T extends { id: string; userId: string }>(
  collectionName: string,
  record: T,
): Promise<void> {
  await setDoc(doc(getFirestoreDb(), docPath(record.userId, collectionName, record.id)), record, {
    merge: true,
  });
}

export async function deleteSubDoc(
  userId: string,
  collectionName: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), docPath(userId, collectionName, id)));
}

export async function listSubDocs<T extends { id: string }>(
  userId: string,
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(
    collection(getFirestoreDb(), colPath(userId, collectionName)).withConverter(converter<T>()),
    ...constraints,
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export function subscribeSubDocs<T extends { id: string }>(
  userId: string,
  collectionName: string,
  onChange: (rows: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), colPath(userId, collectionName)).withConverter(converter<T>()),
    ...constraints,
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data()));
  });
}

export function whereLocalDate(value: string): QueryConstraint {
  return where("localDate", "==", value);
}

export function whereLocalDateRange(start: string, end: string): QueryConstraint[] {
  return [where("localDate", ">=", start), where("localDate", "<=", end)];
}

export async function listSubDocsInRange<T extends { id: string }>(
  userId: string,
  collectionName: string,
  start: string,
  end: string,
): Promise<T[]> {
  return listSubDocs<T>(userId, collectionName, ...whereLocalDateRange(start, end));
}
