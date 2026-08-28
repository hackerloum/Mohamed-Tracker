import { firebasePublicEnv } from "./env";
import { getFirebaseApp } from "./app";

export async function getMessagingIfSupported() {
  if (typeof window === "undefined") return null;
  const { getMessaging, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return null;
  return getMessaging(getFirebaseApp());
}

export function getVapidKey(): string | null {
  return firebasePublicEnv.vapidKey || null;
}

export async function requestWebPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.requestPermission();
}

export async function getWebPushToken(): Promise<string | null> {
  const vapidKey = getVapidKey();
  if (!vapidKey) return null;
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;
  const { getToken } = await import("firebase/messaging");
  const registration = await navigator.serviceWorker.ready.catch(() => undefined);
  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
}

export function listenForegroundMessages(
  handler: (title: string, body: string) => void,
): () => void {
  let unsubscribe: () => void = () => undefined;
  void getMessagingIfSupported().then(async (messaging) => {
    if (!messaging) return;
    const { onMessage } = await import("firebase/messaging");
    unsubscribe = onMessage(messaging, (payload) => {
      handler(payload.notification?.title ?? "Mohamed", payload.notification?.body ?? "");
    });
  });
  return () => unsubscribe();
}
