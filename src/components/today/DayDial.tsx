"use client";

export function DayDial({
  score,
  dateLabel,
  weekday,
  greeting,
  completed,
  total,
  spentLabel,
}: {
  score: number | null;
  dateLabel: string;
  weekday: string;
  greeting: string;
  completed: number;
  total: number;
  spentLabel?: string | null;
}) {
  const ratio = total === 0 ? 0 : Math.min(1, completed / total);

  return (
    <section>
      <p className="text-[13px] text-ink-muted">{weekday}</p>
      <h1 className="font-serif mt-1 text-[48px] leading-[0.92] tracking-[-0.03em] text-ink md:text-[56px]">
        {dateLabel}
      </h1>
      <p className="mt-5 text-[18px] leading-snug text-ink">{greeting}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14px] text-ink-muted">
        <span className="tabular">
          {total === 0 ? "Nothing planned yet" : `${completed} of ${total} done`}
        </span>
        {spentLabel ? (
          <>
            <span aria-hidden>·</span>
            <span className="tabular">{spentLabel}</span>
          </>
        ) : null}
      </div>
      <div className="mt-7 flex items-center gap-4">
        <div className="relative h-[2px] flex-1 overflow-hidden bg-hairline">
          <span
            className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
        {score !== null ? (
          <p className="font-serif tabular text-[28px] leading-none text-ink">{score}</p>
        ) : null}
      </div>
    </section>
  );
}
