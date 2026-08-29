"use client";

export function DayDial({
  score,
  dateLabel,
  weekday,
  greeting,
  completed,
  total,
}: {
  score: number | null;
  dateLabel: string;
  weekday: string;
  greeting: string;
  completed: number;
  total: number;
}) {
  const ratio = total === 0 ? 0 : Math.min(1, completed / total);
  const ticks = 12;

  return (
    <section>
      <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-ink-muted">
        {weekday}
      </p>
      <div className="mt-2 flex items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[0.95] tracking-tight text-ink md:text-5xl">
          {dateLabel}
        </h1>
        {score !== null ? (
          <p className="tabular pb-0.5 text-[42px] font-medium leading-none text-accent md:text-5xl">
            {score}
          </p>
        ) : null}
      </div>
      <p className="mt-4 text-[17px] text-ink">{greeting}</p>
      <p className="mt-1 tabular text-[14px] text-ink-muted">
        {total === 0 ? "Nothing planned yet" : `${completed} / ${total} completed`}
      </p>
      <div className="mt-6 flex h-[3px] items-stretch gap-[3px]" aria-hidden>
        {Array.from({ length: ticks }, (_, index) => {
          const filled = index / ticks < ratio;
          return (
            <span
              key={index}
              className={filled ? "flex-1 bg-accent" : "flex-1 bg-hairline"}
            />
          );
        })}
      </div>
    </section>
  );
}
