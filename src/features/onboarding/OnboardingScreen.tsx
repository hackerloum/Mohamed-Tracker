"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/services/onboardingService";
import { DEFAULT_HABITS, DEFAULT_TIMEZONE } from "@/core/defaults/onboarding";
import { useAuth } from "@/hooks/useAuth";

export function OnboardingScreen(props?: {
  userId?: string;
  displayName?: string | null;
  email?: string | null;
}) {
  const auth = useAuth();
  const userId = props?.userId ?? auth.user?.uid ?? "";
  const displayName = props?.displayName ?? auth.profile?.displayName ?? auth.user?.displayName ?? null;
  const email = props?.email ?? auth.profile?.email ?? auth.user?.email ?? null;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish(skip: boolean) {
    setBusy(true);
    setError(null);
    try {
      await completeOnboarding({
        userId,
        displayName,
        email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE,
        skip,
      });
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish onboarding");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-16 text-ivory">
      <p className="text-[11px] tracking-[0.22em] text-bronze uppercase">Mohamed</p>
      <h1 className="mt-6 max-w-sm text-4xl font-medium tracking-tight">A private desk for the day.</h1>
      <p className="mt-4 max-w-sm text-sm text-mute">
        Defaults can be deleted later. Prayer extras stay off. Skip if you just want the empty desk.
        Notifications stay off until you enable them in settings — iPhone needs the Home Screen app first.
      </p>
      <ul className="mt-10 max-w-sm border-t border-hairline">
        {DEFAULT_HABITS.map((habit) => (
          <li key={habit.name} className="border-b border-hairline py-3 text-ivory">
            {habit.name}
          </li>
        ))}
      </ul>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <div className="mt-auto flex flex-col gap-4 pt-10">
        <button
          type="button"
          disabled={busy}
          onClick={() => void finish(false)}
          className="border-b border-bronze py-3 text-left text-bronze"
        >
          {busy ? "Saving…" : "Use defaults"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void finish(true)}
          className="text-left text-sm text-mute"
        >
          Skip — still seed defaults, extras stay off
        </button>
      </div>
    </div>
  );
}
