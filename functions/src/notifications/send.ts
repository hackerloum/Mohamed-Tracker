import { getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

export interface SendPayload {
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface SendResult {
  delivered: boolean;
  skipped: boolean;
  reason: string;
}

function ensureAdmin(): void {
  if (getApps().length === 0) {
    initializeApp();
  }
}

export async function sendPush(payload: SendPayload): Promise<SendResult> {
  if (!payload.token) {
    return { delivered: false, skipped: true, reason: "No device token." };
  }
  try {
    ensureAdmin();
    await getMessaging().send({
      token: payload.token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      webpush: {
        fcmOptions: {
          link: payload.data.url ?? "/today",
        },
      },
    });
    return { delivered: true, skipped: false, reason: "Sent." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FCM send failed.";
    return { delivered: false, skipped: true, reason: message };
  }
}
