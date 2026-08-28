"use client";

import { useMemo, useState } from "react";
import { BudgetRow } from "@/components/money/budget-row";
import { TransactionLogger } from "@/components/money/transaction-logger";
import { Button } from "@/components/ui/Button";
import { monthKey } from "@/core/dates/localDate";
import { parseKeypadDigits } from "@/core/money/integer";
import { DEFAULT_TIMEZONE } from "@/core/types/money";
import { AmountDisplay } from "@/components/money/amount-display";
import { NumericKeypad } from "@/components/money/numeric-keypad";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";
import { useAuth } from "@/hooks/use-auth";
import { useBudgets } from "@/hooks/use-budgets";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import { useMoneyDashboard } from "@/hooks/use-money-dashboard";
import { saveBudget } from "@/services/money-service";

export function BudgetsScreen() {
  const { user } = useAuth();
  const month = monthKey(new Date(), DEFAULT_TIMEZONE);
  const { rows, loading, error } = useBudgets(month);
  const { categories } = useMoneyCatalog();
  const { monthSummary } = useMoneyDashboard("month");
  const [editorOpen, setEditorOpen] = useState(false);
  const [target, setTarget] = useState<"overall" | string>("overall");
  const [digits, setDigits] = useState("");

  const overall = rows.find((row) => row.type === "overall");
  const byCategory = useMemo(() => {
    const map = new Map(rows.filter((row) => row.type === "category").map((row) => [row.categoryId, row]));
    return map;
  }, [rows]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of monthSummary.byCategory) map.set(item.id, item.amount);
    return map;
  }, [monthSummary.byCategory]);

  async function save() {
    if (!user) return;
    const amount = parseKeypadDigits(digits);
    await saveBudget(user.uid, {
      monthKey: month,
      type: target === "overall" ? "overall" : "category",
      categoryId: target === "overall" ? undefined : target,
      amount,
    });
    setEditorOpen(false);
    setDigits("");
  }

  const expenseCategories = categories.filter(
    (row) => !row.archived && row.kind !== "income",
  );

  return (
    <>
      <p className="mb-6 text-[14px] text-[var(--atelier-muted)]">
        Monthly budgets for {month}. Progress is from live transactions.
      </p>
      {error ? <p className="mb-3 text-[14px] text-red-400">{error}</p> : null}
      {loading ? (
        <p className="text-[14px] text-[var(--atelier-muted)]">Loading budgets…</p>
      ) : (
        <>
          <BudgetRow
            label="overall"
            spent={monthSummary.spent}
            limit={overall?.amount ?? 0}
          />
          {expenseCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="block w-full text-left"
              onClick={() => {
                setTarget(category.id);
                setDigits(String(byCategory.get(category.id)?.amount ?? ""));
                setEditorOpen(true);
              }}
            >
              <BudgetRow
                label={category.name}
                spent={spentByCategory.get(category.id) ?? 0}
                limit={byCategory.get(category.id)?.amount ?? 0}
              />
            </button>
          ))}
        </>
      )}

      <div className="mt-6">
        <Button
          onClick={() => {
            setTarget("overall");
            setDigits(String(overall?.amount ?? ""));
            setEditorOpen(true);
          }}
        >
          Set overall budget
        </Button>
      </div>

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent>
          <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4">
            <SheetTitle className="text-[18px] text-[var(--atelier-text)]">
              {target === "overall"
                ? "Overall monthly budget"
                : `${categories.find((row) => row.id === target)?.name ?? "Category"} budget`}
            </SheetTitle>
            <SheetDescription className="mt-1 text-[13px] text-[var(--atelier-muted)]">
              Integer TZS for {month}
            </SheetDescription>
            <AmountDisplay digits={digits} />
            <NumericKeypad value={digits} onChange={setDigits} />
            <Button className="mt-4 w-full" onClick={() => void save()}>
              Save budget
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <TransactionLogger />
    </>
  );
}
