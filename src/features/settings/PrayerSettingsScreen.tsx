"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/services/profile";
import { useState } from "react";

export function PrayerSettingsScreen() {
  const { profile, user } = useAuth();
  const [extras, setExtras] = useState(profile?.prayerExtras ?? false);

  async function toggle(next: boolean) {
    setExtras(next);
    if (user) await updateProfile(user.uid, { prayerExtras: next });
  }

  return (
    <Screen>
      <AppHeader title="Prayer" />
      <p className="text-sm text-ink-muted">
        Five daily prayers are always shown. Extra prayers stay off unless you enable them.
      </p>
      <Toggle
        label="Extra prayers"
        detail="Witr and sunnah extras. Off by default."
        checked={extras}
        onChange={(next) => void toggle(next)}
      />
    </Screen>
  );
}
