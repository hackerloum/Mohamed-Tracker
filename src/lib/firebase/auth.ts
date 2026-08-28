import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "./app";

let auth: Auth | null = null;
const provider = new GoogleAuthProvider();

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function signInWithGoogle(): Promise<User> {
  const instance = getFirebaseAuth();
  try {
    const result = await signInWithPopup(instance, provider);
    return result.user;
  } catch {
    await signInWithRedirect(instance, provider);
    const redirected = await getRedirectResult(instance);
    if (!redirected?.user) {
      throw new Error("Google sign-in did not complete.");
    }
    return redirected.user;
  }
}

export async function completeGoogleRedirect(): Promise<User | null> {
  const redirected = await getRedirectResult(getFirebaseAuth());
  return redirected?.user ?? null;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export async function getOwnerClaim(user: User): Promise<boolean> {
  const token = await user.getIdTokenResult(true);
  return token.claims.owner === true;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
