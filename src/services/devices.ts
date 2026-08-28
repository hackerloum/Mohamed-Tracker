import { nowIso, todayLocalDate } from "@/core/dates/localDate";
import type { UserDevice } from "@/core/types";
import { getVapidKey, getWebPushToken, requestWebPushPermission } from "@/lib/firebase/messaging";
import { detectPlatform, deviceId, iosNeedsInstall } from "@/lib/pwa";
import { listDevices, writeDevice } from "@/repositories/devices";

export interface EnablePushResult {
  ok: boolean;
  reason: string;
}

export async function enableNotifications(userId: string): Promise<EnablePushResult> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "Notifications are device-only." };
  }
  if (iosNeedsInstall(window.navigator.userAgent)) {
    return {
      ok: false,
      reason:
        "On iPhone, add Mohamed to the Home Screen first (Share → Add to Home Screen), then enable notifications from the installed app.",
    };
  }
  if (!("Notification" in window)) {
    return { ok: false, reason: "This browser does not support notifications." };
  }
  if (!getVapidKey()) {
    return {
      ok: false,
      reason: "VAPID key is not set. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local.",
    };
  }
  const permission = await requestWebPushPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Permission was not granted." };
  }
  const token = await getWebPushToken();
  if (!token) {
    return { ok: false, reason: "Could not get an FCM token. Install the PWA and retry." };
  }
  const stamp = nowIso();
  const device: UserDevice = {
    id: deviceId(),
    userId,
    token,
    platform: detectPlatform(window.navigator.userAgent),
    userAgent: window.navigator.userAgent,
    lastSeenAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await writeDevice(device);
  return { ok: true, reason: "This device is registered." };
}

export async function listRegisteredDevices(userId: string): Promise<UserDevice[]> {
  return listDevices(userId);
}

export { todayLocalDate };
