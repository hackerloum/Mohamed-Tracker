import { formatTzs } from "@/core/money/integer";

export function AmountDisplay({
  digits,
  prefix = "TZS",
}: {
  digits: string;
  prefix?: string;
}) {
  const amount = digits.length === 0 ? 0 : Number.parseInt(digits, 10);
  return (
    <div className="py-4 text-center">
      <p className="mb-1 text-[13px] uppercase tracking-[0.18em] text-[var(--atelier-muted)]">
        {prefix}
      </p>
      <p className="font-mono text-[52px] leading-none tabular-nums tracking-tight text-[var(--atelier-text)]">
        {formatTzs(Number.isInteger(amount) ? amount : 0)}
      </p>
    </div>
  );
}
