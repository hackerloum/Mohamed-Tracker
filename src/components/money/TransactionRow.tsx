import { formatTzs } from "@/core/money/integer";
import type { Transaction } from "@/core/types/money";

export function TransactionRow({
  transaction,
  categoryName,
}: {
  transaction: Transaction;
  categoryName: string;
}) {
  const signed =
    transaction.type === "expense"
      ? `−${formatTzs(transaction.amount)}`
      : `+${formatTzs(transaction.amount)}`;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-3">
      <div className="min-w-0">
        <p className="truncate text-[16px] text-ink">
          {transaction.note || transaction.description || categoryName}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          {categoryName}
          <span className="mx-1.5">·</span>
          {transaction.localDate}
        </p>
      </div>
      <p
        className={`shrink-0 tabular text-[16px] ${
          transaction.type === "income" ? "text-accent" : "text-ink"
        }`}
      >
        {signed}
      </p>
    </div>
  );
}

export function MoneyEmpty({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="py-10">
      <p className="text-[16px] text-ink">{title}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-3 text-[15px] text-accent underline decoration-accent underline-offset-4"
      >
        {actionLabel}
      </button>
    </div>
  );
}
