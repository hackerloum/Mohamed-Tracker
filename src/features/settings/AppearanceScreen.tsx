"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Hairline } from "@/components/ui/Hairline";
import { useUiStore } from "@/stores/ui";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/services/profile";
import type { ThemeMode } from "@/core/types";
import { cn } from "@/lib/cn";

const modes: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export function AppearanceScreen() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const { user } = useAuth();

  async function choose(next: ThemeMode) {
    setTheme(next);
    if (user) {
      await updateProfile(user.uid, { theme: next });
    }
  }

  return (
    <Screen>
      <AppHeader title="Appearance" />
      <p className="mb-4 text-sm text-ink-muted">Warm charcoal in dark, ivory in light. Accent stays oxidized bronze.</p>
      <ul>
        {modes.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              onClick={() => void choose(mode.id)}
              className={cn(
                "flex w-full items-center justify-between py-3 text-left",
                theme === mode.id ? "text-ink" : "text-ink-muted",
              )}
            >
              {mode.label}
              {theme === mode.id ? <span className="h-px w-8 bg-accent" /> : null}
            </button>
            <Hairline />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
