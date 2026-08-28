import { budgetProgressCopy, percentUsed } from "@/core/money/budget";
import { formatTzs } from "@/core/money/integer";

export function BudgetRow({
  label,
  spent,
  limit,
}: {
  label: string;
  spent: number;
  limit: number;
}) {
  const pct = percentUsed(spent, limit);
  const width = pct === null ? 0 : Math.min(pct, 100);
  return (
    <div className="border-b border-[var(--atelier-hairline)] py-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[16px] text-[var(--atelier-text)]">{label}</p>
        <p className="font-mono text-[14px] tabular-nums text-[var(--atelier-muted)]">
          {formatTzs(spent, { withCode: true })}
          {limit > 0 ? ` / ${formatTzs(limit)}` : ""}
        </p>
      </div>
      <div className="mt-3 h-px bg-[var(--atelier-hairline)]">
        <div
          className="h-px bg-[var(--atelier-accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-[var(--atelier-muted)]">
        {budgetProgressCopy({ spent, limit, label })}
      </p>
    </div>
  );
}
