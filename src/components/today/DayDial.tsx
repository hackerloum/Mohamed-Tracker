"use client";

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE * 0.75;

export function DayDial({
  score,
  dateLabel,
  weekday,
}: {
  score: number | null;
  dateLabel: string;
  weekday: string;
}) {
  const dash = score === null ? 0 : (Math.max(0, Math.min(100, score)) / 100) * ARC;

  return (
    <section className="relative mx-auto flex h-64 w-64 items-center justify-center">
      <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform="rotate(135 110 110)">
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke="#2e2b26"
            strokeWidth="5"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke="#c4a574"
            strokeWidth="5"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="relative z-10 text-center">
        <p className="text-[11px] tracking-[0.22em] text-mute uppercase">{weekday}</p>
        <p className="mt-1 text-3xl font-medium tracking-tight text-ivory">{dateLabel}</p>
        {score === null ? (
          <p className="mt-3 text-sm text-mute">No score yet</p>
        ) : (
          <p className="tabular mt-3 text-5xl font-medium text-bronze">{score}</p>
        )}
      </div>
    </section>
  );
}
