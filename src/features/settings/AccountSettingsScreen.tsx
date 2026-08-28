"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";

export function AccountSettingsScreen() {
  const { user, profile } = useAuth();

  return (
    <Screen>
      <AppHeader title="Account" />
      <p className="text-[1.05rem] text-ink">{profile?.displayName ?? user?.displayName ?? "Owner"}</p>
      <p className="mt-1 text-sm text-ink-muted">{profile?.email ?? user?.email ?? "No email on this session."}</p>
      <p className="mt-4 text-xs text-ink-muted">UID {user?.uid ?? "—"}</p>
      <div className="mt-8">
        <Button variant="danger" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </Screen>
  );
}
