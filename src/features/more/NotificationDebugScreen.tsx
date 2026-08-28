"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Hairline } from "@/components/ui/Hairline";
import { useAuth } from "@/hooks/useAuth";
import { getVapidKey } from "@/lib/firebase/messaging";
import { isStandaloneDisplay, iosNeedsInstall } from "@/lib/pwa";
import { enableNotifications, listRegisteredDevices } from "@/services/devices";
import { createInAppNotification } from "@/services/notifications";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import { getFirebaseApp } from "@/lib/firebase/app";
import type { UserDevice } from "@/core/types";

function maskToken(token: string): string {
  if (token.length < 12) return "••••";
  return `${token.slice(0, 8)}…${token.slice(-4)}`;
}

export function NotificationDebugScreen() {
  const { status, user, profile } = useAuth();
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void listRegisteredDevices(user.uid).then(setDevices).catch(() => setDevices([]));
  }, [user]);

  if (status !== "owner") {
    return (
      <Screen>
        <AppHeader title="Notification debug" />
        <EmptyState title="Owner only." detail="This panel is hidden from unauthorized accounts." />
      </Screen>
    );
  }

  async function register() {
    if (!user) return;
    setBusy(true);
    const result = await enableNotifications(user.uid);
    setLog(result.reason);
    const next = await listRegisteredDevices(user.uid);
    setDevices(next);
    setBusy(false);
  }

  async function sendInApp() {
    if (!user || !profile) return;
    setBusy(true);
    await createInAppNotification({
      userId: user.uid,
      timezone: profile.timezone,
      title: "Test notice",
      body: "In-app only. No FCM credentials are used on the client.",
      kind: "debug",
      url: "/more/notifications",
    });
    setLog("Wrote an in-app notification. Check /more/notifications.");
    setBusy(false);
  }

  async function callFunction() {
    if (!user || !isFirebaseConfigured()) {
      setLog("Firebase is not configured.");
      return;
    }
    setBusy(true);
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const callable = httpsCallable(getFunctions(getFirebaseApp()), "debugSendNotification");
      const result = await callable();
      setLog(`Function response: ${JSON.stringify(result.data)}`);
    } catch (error) {
      setLog(
        error instanceof Error
          ? `Functions not reachable (${error.message}). Deploy functions on Blaze after setting VAPID.`
          : "Functions not reachable.",
      );
    }
    setBusy(false);
  }

  return (
    <Screen>
      <AppHeader title="Notification debug" />
      <p className="text-sm leading-relaxed text-ink-muted">
        Owner-only. No secrets are shown. Server FCM credentials stay in Cloud Functions.
      </p>
      <Hairline className="my-4" />
      <dl className="space-y-2 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">VAPID configured</dt>
          <dd className="tabular-nums">{getVapidKey() ? "yes" : "no"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Permission</dt>
          <dd>
            {typeof Notification === "undefined" ? "unsupported" : Notification.permission}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Standalone</dt>
          <dd>{isStandaloneDisplay() ? "yes" : "no"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">iOS install needed</dt>
          <dd>{typeof navigator !== "undefined" && iosNeedsInstall(navigator.userAgent) ? "yes" : "no"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Quiet hours</dt>
          <dd>
            {profile?.quietHours.start}–{profile?.quietHours.end}
          </dd>
        </div>
      </dl>
      <Hairline className="my-4" />
      <p className="text-[13px] uppercase tracking-[0.16em] text-ink-muted">Devices</p>
      {devices.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">No devices registered.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {devices.map((device) => (
            <li key={device.id} className="flex justify-between gap-3">
              <span>{device.platform}</span>
              <span className="font-mono tabular-nums text-ink-muted">{maskToken(device.token)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-col gap-3">
        <Button variant="ghost" disabled={busy} onClick={() => void register()}>
          Register this device
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void sendInApp()}>
          Write in-app test
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void callFunction()}>
          Call debugSendNotification
        </Button>
      </div>
      {log ? <p className="mt-4 text-sm text-ink-muted">{log}</p> : null}
    </Screen>
  );
}
