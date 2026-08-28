import { addTzs } from "./integer";
import type {
  DateRange,
  DailyAmount,
  MoneySummary,
  NamedAmount,
  Transaction,
} from "@/core/types/money";

function inRange(localDate: string, range: DateRange): boolean {
  return localDate >= range.start && localDate <= range.end;
}

function sortNamed(rows: NamedAmount[]): NamedAmount[] {
  return [...rows].sort((a, b) => {
    if (b.amount !== a.amount) return b.amount - a.amount;
    return a.id.localeCompare(b.id);
  });
}

function tally(
  rows: Transaction[],
  key: "categoryId" | "paymentMethodId",
): NamedAmount[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const id = row[key];
    if (!id) continue;
    map.set(id, addTzs(map.get(id) ?? 0, row.amount));
  }
  return sortNamed(
    [...map.entries()].map(([id, amount]) => ({ id, amount })),
  );
}

export function summarizeTransactions(
  rows: Transaction[],
  range: DateRange,
): MoneySummary {
  const scoped = rows.filter((row) => inRange(row.localDate, range));
  const expenses = scoped.filter((row) => row.type === "expense");
  const incomeRows = scoped.filter((row) => row.type === "income");

  const spent = expenses.reduce((sum, row) => addTzs(sum, row.amount), 0);
  const income = incomeRows.reduce((sum, row) => addTzs(sum, row.amount), 0);

  let biggestExpense: Transaction | null = null;
  for (const row of expenses) {
    if (!biggestExpense || row.amount > biggestExpense.amount) {
      biggestExpense = row;
    }
  }

  const byDay = new Map<string, number>();
  for (const row of expenses) {
    byDay.set(row.localDate, addTzs(byDay.get(row.localDate) ?? 0, row.amount));
  }
  const dailySpend: DailyAmount[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([localDate, amount]) => ({ localDate, amount }));

  return {
    spent,
    income,
    net: income - spent,
    biggestExpense,
    byCategory: tally(expenses, "categoryId"),
    byPaymentMethod: tally(expenses, "paymentMethodId"),
    dailySpend,
  };
}

export function averageDailySpend(
  spent: number,
  dayCount: number,
): number {
  if (dayCount <= 0) return 0;
  return Math.round(spent / dayCount);
}
