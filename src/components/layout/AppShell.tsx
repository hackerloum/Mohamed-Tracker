"use client";

import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { NavRail } from "./NavRail";
import { QuickAddSheet } from "./QuickAddSheet";
import { SyncIndicator } from "./SyncIndicator";
import { ManualLogSheet } from "@/components/log/manual-log-sheet";
import { useAuth } from "@/hooks/useAuth";
import { useAppSession } from "@/hooks/useAppSession";
import { useUnreadBadge } from "@/hooks/use-notifications";
import { DEFAULT_TIMEZONE } from "@/core/dates";

interface AppShellProps {
  children: ReactNode;
}

export function useAppSessionFromShell() {
  return useAppSession();
}

export { useAppSession };

export function AppShell({ children }: AppShellProps) {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  useUnreadBadge();

  return (
    <div className="flex min-h-dvh bg-bg text-ink">
      <NavRail />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <SyncIndicator />
        <div
          className="flex-1 pb-[calc(var(--nav-height)+var(--safe-bottom)+0.5rem)] md:pb-8"
          style={{ paddingTop: "var(--safe-top)" }}
        >
          {children}
        </div>
        <BottomNav />
      </div>
      <QuickAddSheet />
      {user ? <ManualLogSheet userId={user.uid} timezone={timezone} /> : null}
    </div>
  );
}
