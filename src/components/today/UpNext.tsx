"use client";

import type { NextAction } from "@/core/engines/nextAction";

export function UpNext({
  action,
  onAct,
}: {
  action: NextAction | null;
  onAct: (action: NextAction) => void;
}) {
  if (!action) return null;

  return (
    <button
      type="button"
      onClick={() => onAct(action)}
      className="flex w-full items-end justify-between gap-4 border-y border-hairline py-5 text-left active:opacity-70"
    >
      <div className="min-w-0">
        <p className="text-[13px] text-ink-muted">Up next</p>
        <p className="font-serif mt-1 text-[28px] leading-[1.05] tracking-[-0.02em] text-ink">
          {action.title}
        </p>
        <p className="mt-1.5 text-[14px] text-ink-muted">{action.reason}</p>
      </div>
      <span className="mb-1 shrink-0 text-[14px] text-accent">Start</span>
    </button>
  );
}
