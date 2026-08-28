export const firebasePublicEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "",
};

const PLACEHOLDER_MARKERS = ["your-api-key", "your-project-id", ""];

export function isFirebaseConfigured(): boolean {
  return (
    firebasePublicEnv.apiKey.length > 0 &&
    !PLACEHOLDER_MARKERS.includes(firebasePublicEnv.apiKey) &&
    firebasePublicEnv.projectId.length > 0 &&
    !PLACEHOLDER_MARKERS.includes(firebasePublicEnv.projectId)
  );
}
