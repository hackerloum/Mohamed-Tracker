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

  return (
    <section>
      <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-ink-muted">Prayer</p>
      <div className="relative mt-5 flex items-start">
        <span className="absolute top-[7px] right-4 left-4 h-px bg-hairline" aria-hidden />
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
      className="relative z-[1] flex flex-1 flex-col items-center gap-2.5 active:opacity-70"
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
      <span
        className={`h-[15px] w-[15px] rounded-full border ${
          done ? "border-accent bg-accent" : "border-ink-muted/50 bg-bg"
        }`}
      />
      <span className={`text-[11px] tracking-wide ${done ? "text-ink" : "text-ink-muted"}`}>
        {label}
      </span>
    </button>
  );
}
