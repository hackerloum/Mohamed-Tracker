"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Toggle } from "@/components/ui/Toggle";
import { Hairline } from "@/components/ui/Hairline";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_NOTIFICATION_PREFS } from "@/core/types/user";
import { updateNotificationPrefs } from "@/services/profile";
import { enableNotifications } from "@/services/devices";
import { getVapidKey } from "@/lib/firebase/messaging";
import { iosNeedsInstall } from "@/lib/pwa";
import type { NotificationPrefs } from "@/core/types";

const rows: Array<{
  key: keyof Omit<NotificationPrefs, "quietHours">;
  label: string;
  detail: string;
}> = [
  { key: "morningBriefing", label: "Morning briefing", detail: "Around 07:00, if something is still open." },
  { key: "eveningReview", label: "Evening review", detail: "Around 21:00, pointing at reflection." },
  { key: "weeklyReview", label: "Weekly review", detail: "Friday evening, when stored diffs exist." },
  { key: "habitReminders", label: "Habit reminders", detail: "Uses the same Up Next order as Today." },
  { key: "prayerReminders", label: "Prayer reminders", detail: "Only if that prayer is still unlogged." },
  { key: "budgetAlerts", label: "Budget alerts", detail: "When a stored budget is over its limit." },
  { key: "goalAlerts", label: "Goal alerts", detail: "When a stored goal reaches its target." },
];

export function NotificationSettingsScreen() {
  const { profile, user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    () => profile?.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const iosInstall = typeof navigator !== "undefined" && iosNeedsInstall(navigator.userAgent);

  async function patch(next: NotificationPrefs) {
    setPrefs(next);
    if (user) await updateNotificationPrefs(user.uid, next);
  }

  async function enable() {
    if (!user) return;
    setBusy(true);
    const result = await enableNotifications(user.uid);
    setStatus(result.reason);
    setBusy(false);
  }

  return (
    <Screen>
      <AppHeader title="Notifications" />
      <p className="text-sm text-ink-muted">
        Permission is never requested on first paint. Enable only after you choose to.
      </p>
      {iosInstall ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          iPhone web push works only after the app is installed. Open Share, tap Add to Home Screen,
          then open Mohamed from the home screen and enable notifications here.
        </p>
      ) : null}
      {!getVapidKey() ? (
        <p className="mt-3 text-sm text-ink-muted">
          FCM VAPID key is not configured yet. Device registration will wait until it is.
        </p>
      ) : null}
      <div className="mt-4">
        <Button variant="ghost" disabled={busy} onClick={() => void enable()}>
          {busy ? "Enabling…" : "Enable notifications"}
        </Button>
      </div>
      {status ? <p className="mt-3 text-sm text-ink-muted">{status}</p> : null}
      <Hairline className="my-4" />
      {rows.map((row) => (
        <Toggle
          key={row.key}
          label={row.label}
          detail={row.detail}
          checked={prefs[row.key]}
          onChange={(checked) => void patch({ ...prefs, [row.key]: checked })}
        />
      ))}
      <Hairline className="my-2" />
      <p className="py-3 text-sm text-ink-muted">
        Quiet hours {prefs.quietHours.start}–{prefs.quietHours.end} (Africa/Dar_es_Salaam). Sends are
        re-checked and skipped in that window.
      </p>
    </Screen>
  );
}
