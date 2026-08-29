"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NamedAmountChart, SpendTrendChart } from "@/components/money/charts";
import { TransactionLogger } from "@/components/money/transaction-logger";
import {
  MoneyEmpty,
  TransactionRow,
} from "@/components/money/TransactionRow";
import { Button } from "@/components/ui/Button";
import { formatTzs } from "@/core/money/integer";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import {
  useMoneyDashboard,
  type MoneyPeriod,
} from "@/hooks/use-money-dashboard";
import { useMoneyUiStore } from "@/stores/money-ui-store";

const PERIODS: { id: MoneyPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function MoneyDashboard() {
  const [period, setPeriod] = useState<MoneyPeriod>("today");
  const { categories, paymentMethods } = useMoneyCatalog();
  const {
    summary,
    monthSummary,
    averageDaily,
    recent,
    loading,
    error,
  } = useMoneyDashboard(period);
  const openLogger = useMoneyUiStore((state) => state.openLogger);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of categories) map.set(row.id, row.name);
    return map;
  }, [categories]);

  const methodNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of paymentMethods) map.set(row.id, row.name);
    return map;
  }, [paymentMethods]);

  const biggest = summary.biggestExpense;
  const emptyToday = period === "today" && summary.spent === 0 && summary.income === 0;

  return (
    <>
      <div className="mb-7 grid grid-cols-3 rounded-full bg-bg-raised p-1">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={`rounded-full py-2 text-[13px] ${
              period === item.id ? "bg-bg-overlay text-ink" : "text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 text-[14px] text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-[14px] text-ink-muted">Loading money…</p>
      ) : emptyToday ? (
        <MoneyEmpty
          title="No expenses logged today."
          actionLabel="Add expense"
          onAction={() => openLogger("expense")}
        />
      ) : (
        <>
          <section className="pb-8">
            <p className="text-[13px] text-ink-muted">Spent</p>
            <p className="font-serif mt-2 text-[44px] leading-none tracking-[-0.03em] tabular-nums text-ink">
              {formatTzs(summary.spent, { withCode: true })}
            </p>
            <dl className="mt-6 space-y-2.5 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Income this month</dt>
                <dd className="tabular text-ink">{formatTzs(monthSummary.income, { withCode: true })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Net this month</dt>
                <dd className="tabular text-ink">{formatTzs(monthSummary.net, { withCode: true })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Average daily</dt>
                <dd className="tabular text-ink">{formatTzs(averageDaily, { withCode: true })}</dd>
              </div>
            </dl>
          </section>

          <section className="pb-8">
            <h2 className="mb-2 text-[13px] text-ink-muted">Biggest expense</h2>
            {biggest ? (
              <p className="text-[16px] text-ink">
                {formatTzs(biggest.amount, { withCode: true })}
                <span className="text-ink-muted">
                  {" "}
                  · {categoryNames.get(biggest.categoryId) ?? "Expense"}
                  {biggest.note ? ` · ${biggest.note}` : ""}
                </span>
              </p>
            ) : (
              <p className="text-[15px] text-ink-muted">No expenses in this period.</p>
            )}
          </section>

          <section className="pb-8">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Category breakdown
            </h2>
            {summary.byCategory.length === 0 ? (
              <p className="text-[15px] text-[var(--atelier-muted)]">
                No category spend to chart yet.
              </p>
            ) : (
              <NamedAmountChart data={summary.byCategory} names={categoryNames} />
            )}
          </section>

          <section className="pb-8">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Spending trend
            </h2>
            {summary.dailySpend.length === 0 ? (
              <p className="text-[15px] text-[var(--atelier-muted)]">
                No daily spend to chart yet.
              </p>
            ) : (
              <SpendTrendChart data={summary.dailySpend} />
            )}
          </section>

          <section className="pb-8">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Payment methods
            </h2>
            {summary.byPaymentMethod.length === 0 ? (
              <p className="text-[15px] text-[var(--atelier-muted)]">
                No payment-method spend to chart yet.
              </p>
            ) : (
              <NamedAmountChart
                data={summary.byPaymentMethod}
                names={methodNames}
              />
            )}
          </section>

          <section className="pb-8">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Recent
            </h2>
            {recent.length === 0 ? (
              <p className="text-[15px] text-[var(--atelier-muted)]">
                No transactions this month.
              </p>
            ) : (
              recent.map((row) => (
                <TransactionRow
                  key={row.id}
                  transaction={row}
                  categoryName={categoryNames.get(row.categoryId) ?? "Uncategorized"}
                />
              ))
            )}
          </section>
        </>
      )}

      <div className="flex flex-wrap gap-3 pb-6">
        <Button onClick={() => openLogger("expense")}>Add expense</Button>
        <Button variant="hairline" onClick={() => openLogger("income")}>
          Add income
        </Button>
        <Link
          href="/money/budgets"
          className="self-center text-[14px] text-[var(--atelier-accent)] underline-offset-4 hover:underline"
        >
          Budgets
        </Link>
      </div>
      <TransactionLogger />
    </>
  );
}
