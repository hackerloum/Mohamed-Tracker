"use client";

import type { NextAction } from "@/core/engines/nextAction";

export function UpNext({
  action,
  onAct,
}: {
  action: NextAction | null;
  onAct: (action: NextAction) => void;
}) {
  return (
    <section>
      <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-ink-muted">Up next</p>
      {action ? (
        <button
          type="button"
          onClick={() => onAct(action)}
          className="mt-3 w-full border-b border-accent/70 pb-4 text-left active:opacity-70"
        >
          <p className="text-[26px] font-medium leading-tight tracking-tight text-ink">
            {action.title}
          </p>
          <p className="mt-1.5 text-[14px] text-ink-muted">{action.reason}</p>
        </button>
      ) : (
        <p className="mt-3 text-[15px] text-ink-muted">Nothing waiting. Plan the day or log something.</p>
      )}
    </section>
  );
}
