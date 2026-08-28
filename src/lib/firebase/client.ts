import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirebaseApp, isFirebaseConfigured } from "./app";
import { getFirebaseAuth } from "./auth";
import { getFirestoreDb } from "./firestore";

export { getFirebaseApp, isFirebaseConfigured };

export function getClientFirestore(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  return getFirestoreDb();
}

export function getClientAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  return getFirebaseAuth();
}
