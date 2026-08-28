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
      <p className="text-[11px] tracking-[0.18em] text-mute uppercase">Up next</p>
      {action ? (
        <button
          type="button"
          onClick={() => onAct(action)}
          className="mt-3 w-full border-b border-bronze pb-3 text-left"
        >
          <p className="text-2xl font-medium tracking-tight text-ivory">{action.title}</p>
          <p className="mt-1 text-sm text-mute">{action.reason}</p>
        </button>
      ) : (
        <p className="mt-3 text-sm text-mute">Nothing queued. Add a habit or a task.</p>
      )}
    </section>
  );
}
