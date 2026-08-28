import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { loadLocalEnv } from "./loadEnv";

loadLocalEnv();

function loadAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey || privateKey.includes("...")) {
    throw new Error(
      "Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local",
    );
  }
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function main() {
  const uid = process.argv[2] ?? process.env.OWNER_UID;
  if (!uid) {
    throw new Error("Pass a UID: npm run set-owner -- <uid>");
  }
  loadAdmin();
  await getAuth().setCustomUserClaims(uid, { owner: true });
  console.log(`Set owner: true on ${uid}. Sign out and back in (or refresh the ID token).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
