import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { firebasePublicEnv, isFirebaseConfigured } from "./env";

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and add your web config.",
    );
  }
  app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: firebasePublicEnv.apiKey,
        authDomain: firebasePublicEnv.authDomain,
        projectId: firebasePublicEnv.projectId,
        storageBucket: firebasePublicEnv.storageBucket,
        messagingSenderId: firebasePublicEnv.messagingSenderId,
        appId: firebasePublicEnv.appId,
        measurementId: firebasePublicEnv.measurementId || undefined,
      });
  return app;
}

export { isFirebaseConfigured };
