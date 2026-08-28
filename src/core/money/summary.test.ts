import { describe, expect, it } from "vitest";
import type { Transaction } from "@/core/types/money";
import { summarizeTransactions } from "./summary";

function tx(
  partial: Pick<Transaction, "id" | "type" | "amount" | "localDate"> &
    Partial<Transaction>,
): Transaction {
  return {
    userId: "u1",
    currency: "TZS",
    categoryId: "food",
    paymentMethodId: "cash",
    timezone: "Africa/Dar_es_Salaam",
    kind: partial.type,
    createdAt: new Date("2026-08-28T10:00:00+03:00"),
    updatedAt: new Date("2026-08-28T10:00:00+03:00"),
    ...partial,
  };
}

describe("summarizeTransactions", () => {
  const rows: Transaction[] = [
    tx({ id: "1", type: "expense", amount: 25000, localDate: "2026-08-28", categoryId: "food" }),
    tx({ id: "2", type: "expense", amount: 8000, localDate: "2026-08-27", categoryId: "transport" }),
    tx({ id: "3", type: "income", amount: 120000, localDate: "2026-08-28", categoryId: "business" }),
    tx({ id: "4", type: "expense", amount: 40000, localDate: "2026-08-01", categoryId: "food" }),
  ];

  it("sums spent, income, and net inside the range", () => {
    const summary = summarizeTransactions(rows, {
      start: "2026-08-27",
      end: "2026-08-28",
    });
    expect(summary.spent).toBe(33000);
    expect(summary.income).toBe(120000);
    expect(summary.net).toBe(87000);
  });

  it("finds the biggest expense in range", () => {
    const summary = summarizeTransactions(rows, {
      start: "2026-08-01",
      end: "2026-08-28",
    });
    expect(summary.biggestExpense?.id).toBe("4");
    expect(summary.biggestExpense?.amount).toBe(40000);
  });

  it("breaks down expense by category and payment method", () => {
    const summary = summarizeTransactions(rows, {
      start: "2026-08-01",
      end: "2026-08-28",
    });
    expect(summary.byCategory).toEqual([
      { id: "food", amount: 65000 },
      { id: "transport", amount: 8000 },
    ]);
    expect(summary.byPaymentMethod).toEqual([{ id: "cash", amount: 73000 }]);
  });

  it("builds a daily spend trend", () => {
    const summary = summarizeTransactions(rows, {
      start: "2026-08-27",
      end: "2026-08-28",
    });
    expect(summary.dailySpend).toEqual([
      { localDate: "2026-08-27", amount: 8000 },
      { localDate: "2026-08-28", amount: 25000 },
    ]);
  });

  it("returns zeros when there is nothing in range", () => {
    const summary = summarizeTransactions(rows, {
      start: "2026-07-01",
      end: "2026-07-31",
    });
    expect(summary.spent).toBe(0);
    expect(summary.income).toBe(0);
    expect(summary.net).toBe(0);
    expect(summary.biggestExpense).toBeNull();
    expect(summary.byCategory).toEqual([]);
    expect(summary.dailySpend).toEqual([]);
  });
});
