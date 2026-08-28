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
      <p className="text-[11px] tracking-[0.18em] text-mute uppercase">Prayer</p>
      <div className="mt-3 flex gap-2">
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
      className="flex flex-1 flex-col items-center gap-2"
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
      <span className={`h-8 w-[3px] rounded-full ${done ? "bg-bronze" : "bg-hairline"}`} />
      <span className={`text-[10px] tracking-wide uppercase ${done ? "text-ivory" : "text-mute"}`}>
        {label}
      </span>
    </button>
  );
}
