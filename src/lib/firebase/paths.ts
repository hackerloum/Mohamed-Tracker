import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";
import { getFirestoreDb } from "./firestore";

export function userCollection(
  userId: string,
  name: string,
): CollectionReference;
export function userCollection(
  db: Firestore,
  userId: string,
  name: string,
): CollectionReference;
export function userCollection(
  dbOrUserId: Firestore | string,
  userIdOrName: string,
  name?: string,
): CollectionReference {
  if (typeof dbOrUserId === "string") {
    return collection(getFirestoreDb(), "users", dbOrUserId, userIdOrName);
  }
  return collection(dbOrUserId, "users", userIdOrName, name ?? "");
}

export function userDoc(userId: string): DocumentReference;
export function userDoc(
  db: Firestore,
  userId: string,
  name: string,
  id: string,
): DocumentReference;
export function userDoc(
  dbOrUserId: Firestore | string,
  userId?: string,
  name?: string,
  id?: string,
): DocumentReference {
  if (typeof dbOrUserId === "string") {
    return doc(getFirestoreDb(), "users", dbOrUserId);
  }
  return doc(dbOrUserId, "users", userId ?? "", name ?? "", id ?? "");
}

export function userSubDoc(userId: string, name: string, id: string): DocumentReference {
  return doc(getFirestoreDb(), "users", userId, name, id);
}
