import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseApp, isFirebaseConfigured } from "./app";

let db: Firestore | null = null;

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super("Firebase web config is missing. Add keys to .env.local.");
    this.name = "FirebaseNotConfiguredError";
  }
}

export function getFirestoreDb(): Firestore {
  if (db) return db;
  const persistable =
    typeof window !== "undefined" && typeof indexedDB !== "undefined";
  try {
    db = initializeFirestore(getFirebaseApp(), {
      localCache: persistable
        ? persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          })
        : memoryLocalCache(),
    });
  } catch {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  return getFirestoreDb();
}

export function getDb(): Firestore {
  return getFirestoreDb();
}

export function requireDb(): Firestore {
  if (!isFirebaseConfigured()) throw new FirebaseNotConfiguredError();
  return getFirestoreDb();
}
