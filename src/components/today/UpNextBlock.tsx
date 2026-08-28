"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import type { NextAction } from "@/core/engines/nextAction";
import { useUiStore } from "@/stores/ui";

interface UpNextBlockProps {
  action: NextAction | null;
}

export function UpNextBlock({ action }: UpNextBlockProps) {
  const openPlan = useUiStore((s) => s.openPlanSheet);
  const openPrayer = useUiStore((s) => s.openPrayerDetail);

  if (!action) {
    return <EmptyState title="Nothing queued for now." detail="Up Next fills once today’s plan and habits exist." />;
  }

  const current = action;

  return (
    <button
      type="button"
      onClick={() => {
        if (current.kind === "plan") openPlan();
        if (current.kind === "prayer") openPrayer(current.key);
      }}
      className="block w-full py-4 text-left"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Up next</p>
      <p className="mt-2 text-2xl leading-tight text-ink">{current.title}</p>
      <p className="mt-1 text-sm text-ink-muted">{current.reason}</p>
    </button>
  );
}
