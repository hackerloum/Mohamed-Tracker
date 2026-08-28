/**
 * Seed script. Never import this from UI code.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { DEFAULT_TIMEZONE } from "../src/core/dates/localDate";
import { nowIso } from "../src/core/dates/localDate";
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_SCORE_WEIGHTS,
} from "../src/core/types/user";
import { loadLocalEnv } from "./loadEnv";

loadLocalEnv();

const DEFAULT_HABITS = ["Plan My Day", "Workout", "Study", "Read", "Daily Reflection"];
const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Business",
  "Entertainment",
  "Family",
  "Health",
  "Education",
  "Motorcycle / Car",
  "Other",
];
const DEFAULT_METHODS = ["Cash", "M-Pesa", "Airtel Money", "Mixx by Yas", "Bank", "Card", "Other"];

function loadAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey || privateKey.includes("...")) {
    throw new Error("Admin credentials missing in .env.local");
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main() {
  const uid = process.argv[2] ?? process.env.OWNER_UID;
  if (!uid) throw new Error("Pass a UID: npm run seed -- <uid>");
  loadAdmin();
  const db = getFirestore();
  const stamp = nowIso();
  const userRef = db.doc(`users/${uid}`);

  await userRef.set(
    {
      id: uid,
      userId: uid,
      createdAt: stamp,
      updatedAt: stamp,
      timezone: DEFAULT_TIMEZONE,
      currency: "TZS",
      theme: "system",
      accent: "#C4A574",
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      prayerExtras: false,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      onboardingComplete: false,
    },
    { merge: true },
  );

  const habits = userRef.collection("habits");
  for (const [index, name] of DEFAULT_HABITS.entries()) {
    const id = `habit-${index + 1}`;
    await habits.doc(id).set({
      id,
      userId: uid,
      createdAt: stamp,
      updatedAt: stamp,
      name,
      icon: "",
      sortOrder: index,
      archived: false,
      frequency: "daily",
      reminderTime: null,
    });
  }

  const categories = userRef.collection("categories");
  for (const [index, name] of DEFAULT_CATEGORIES.entries()) {
    const id = `cat-${index + 1}`;
    await categories.doc(id).set({
      id,
      userId: uid,
      createdAt: stamp,
      updatedAt: stamp,
      name,
      kind: "both",
      sortOrder: index,
      archived: false,
    });
  }

  const methods = userRef.collection("paymentMethods");
  for (const [index, name] of DEFAULT_METHODS.entries()) {
    const id = `pm-${index + 1}`;
    await methods.doc(id).set({
      id,
      userId: uid,
      createdAt: stamp,
      updatedAt: stamp,
      name,
      sortOrder: index,
      archived: false,
    });
  }

  console.log(`Seeded habits, categories, and payment methods for ${uid}. Quiet hours 23:00–06:00.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
