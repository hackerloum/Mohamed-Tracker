"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";

export function SyncIndicator() {
  const status = useNetworkStatus();
  if (status === "online") return null;
  return (
    <p
      className="px-5 py-1.5 text-center text-[11px] uppercase tracking-[0.16em] text-ink-muted"
      role="status"
    >
      Offline · saved locally
    </p>
  );
}
