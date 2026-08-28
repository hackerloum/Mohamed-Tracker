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
      <div className="flex gap-2 pb-6">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={`text-[13px] ${
              period === item.id
                ? "text-[var(--atelier-accent)] underline decoration-[var(--atelier-accent)] underline-offset-4"
                : "text-[var(--atelier-muted)]"
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
        <p className="text-[14px] text-[var(--atelier-muted)]">Loading moneyâ€¦</p>
      ) : emptyToday ? (
        <MoneyEmpty
          title="No expenses logged today."
          actionLabel="Add expense"
          onAction={() => openLogger("expense")}
        />
      ) : (
        <>
          <section className="pb-8">
            <p className="text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Spent
            </p>
            <p className="mt-2 font-mono text-[40px] leading-none tabular-nums text-[var(--atelier-text)]">
              {formatTzs(summary.spent, { withCode: true })}
            </p>
            <dl className="mt-5 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-[var(--atelier-muted)]">Income this month</dt>
                <dd className="font-mono tabular-nums text-[var(--atelier-text)]">
                  {formatTzs(monthSummary.income, { withCode: true })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--atelier-muted)]">Net this month</dt>
                <dd className="font-mono tabular-nums text-[var(--atelier-text)]">
                  {formatTzs(monthSummary.net, { withCode: true })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--atelier-muted)]">Average daily</dt>
                <dd className="font-mono tabular-nums text-[var(--atelier-text)]">
                  {formatTzs(averageDaily, { withCode: true })}
                </dd>
              </div>
            </dl>
          </section>

          <section className="pb-8">
            <h2 className="mb-2 text-[13px] uppercase tracking-[0.16em] text-[var(--atelier-muted)]">
              Biggest expense
            </h2>
            {biggest ? (
              <p className="text-[16px] text-[var(--atelier-text)]">
                {formatTzs(biggest.amount, { withCode: true })}
                <span className="text-[var(--atelier-muted)]">
                  {" "}
                  Â· {categoryNames.get(biggest.categoryId) ?? "Expense"}
                  {biggest.note ? ` Â· ${biggest.note}` : ""}
                </span>
              </p>
            ) : (
              <p className="text-[15px] text-[var(--atelier-muted)]">
                No expenses in this period.
              </p>
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
