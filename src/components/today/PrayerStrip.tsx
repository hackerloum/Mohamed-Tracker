"use client";

import { useRef } from "react";
import { CANONICAL_PRAYERS, EXTRA_PRAYERS, PRAYER_LABELS, type PrayerKey } from "@/core/types";

export function PrayerStrip({
  completedKeys,
  extrasEnabled,
  onTap,
  onLongPress,
}: {
  completedKeys: ReadonlySet<PrayerKey>;
  extrasEnabled: boolean;
  onTap: (key: PrayerKey) => void;
  onLongPress: (key: PrayerKey) => void;
}) {
  const keys: PrayerKey[] = extrasEnabled
    ? [...CANONICAL_PRAYERS, ...EXTRA_PRAYERS]
    : [...CANONICAL_PRAYERS];
  const done = keys.filter((key) => completedKeys.has(key)).length;

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] text-ink-muted">Prayer</p>
        <p className="tabular text-[13px] text-ink-muted">
          {done}/{keys.length}
        </p>
      </div>
      <div className="relative mt-4 flex">
        <span className="absolute top-[6px] right-3 left-3 h-px bg-hairline" aria-hidden />
        {keys.map((key) => (
          <PrayerMark
            key={key}
            label={PRAYER_LABELS[key]}
            done={completedKeys.has(key)}
            onTap={() => onTap(key)}
            onLongPress={() => onLongPress(key)}
          />
        ))}
      </div>
    </section>
  );
}

function PrayerMark({
  label,
  done,
  onTap,
  onLongPress,
}: {
  label: string;
  done: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef(false);

  return (
    <button
      type="button"
      className="relative z-[1] flex flex-1 flex-col items-center gap-2 active:opacity-70"
      onPointerDown={() => {
        longPressRef.current = false;
        timerRef.current = setTimeout(() => {
          longPressRef.current = true;
          onLongPress();
        }, 480);
      }}
      onPointerUp={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!longPressRef.current) onTap();
      }}
      onPointerCancel={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
    >
      <span className={`h-3 w-3 rounded-full ${done ? "bg-accent" : "bg-bg ring-1 ring-ink-muted/45"}`} />
      <span className={`text-[11px] ${done ? "text-ink" : "text-ink-muted"}`}>{label}</span>
    </button>
  );
}
