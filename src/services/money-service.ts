import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
  slugifyName,
} from "@/core/money/defaults";
import { createTransactionInputSchema } from "@/core/schemas/money";
import type {
  MoneyCategory,
  PaymentMethod,
  TransactionType,
} from "@/core/types/money";
import {
  archiveCategory,
  upsertCategory,
} from "@/repositories/categories";
import {
  archivePaymentMethod,
  upsertPaymentMethod,
} from "@/repositories/payment-methods";
import {
  upsertBudget,
  deleteBudget as deleteBudgetRecord,
} from "@/repositories/budgets";
import { createTransaction } from "@/repositories/transactions";
import { emitMoneyActivity } from "./money-activity-service";

export async function ensureMoneyDefaults(userId: string): Promise<void> {
  const expenseWrites = DEFAULT_EXPENSE_CATEGORIES.map((name, index) =>
    upsertCategory({
      id: slugifyName(name),
      userId,
      name,
      kind: name === "Business" ? "both" : "expense",
      sortOrder: index,
    }),
  );
  const incomeWrites = DEFAULT_INCOME_CATEGORIES.filter(
    (name) => name !== "Business" && name !== "Other",
  ).map((name, index) =>
    upsertCategory({
      id: slugifyName(`income-${name}`),
      userId,
      name,
      kind: "income",
      sortOrder: 100 + index,
    }),
  );
  const methodWrites = DEFAULT_PAYMENT_METHODS.map((name, index) =>
    upsertPaymentMethod({
      id: slugifyName(name),
      userId,
      name,
      sortOrder: index,
    }),
  );
  await Promise.all([...expenseWrites, ...incomeWrites, ...methodWrites]);
}

export async function logTransaction(input: {
  userId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  categoryId: string;
  categoryName: string;
  paymentMethodId?: string;
  description?: string;
  note?: string;
  localDate: string;
  timezone: string;
}): Promise<string> {
  const parsed = createTransactionInputSchema.parse({
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? "TZS",
    categoryId: input.categoryId,
    paymentMethodId: input.paymentMethodId,
    description: input.description,
    note: input.note,
    localDate: input.localDate,
    timezone: input.timezone,
  });

  const id = await createTransaction({
    userId: input.userId,
    type: parsed.type,
    amount: parsed.amount,
    currency: parsed.currency,
    categoryId: parsed.categoryId,
    paymentMethodId: parsed.paymentMethodId,
    description: parsed.description,
    note: parsed.note,
    localDate: parsed.localDate,
    timezone: parsed.timezone,
  });

  await emitMoneyActivity({
    userId: input.userId,
    transactionId: id,
    type: parsed.type,
    amount: parsed.amount,
    categoryName: input.categoryName,
    localDate: parsed.localDate,
    timezone: parsed.timezone,
    note: parsed.note,
  });

  return id;
}

export async function saveCategory(
  userId: string,
  input: { id?: string; name: string; kind: MoneyCategory["kind"]; sortOrder: number },
): Promise<void> {
  await upsertCategory({
    id: input.id ?? slugifyName(input.name),
    userId,
    name: input.name.trim(),
    kind: input.kind,
    sortOrder: input.sortOrder,
  });
}

export async function hideCategory(userId: string, id: string): Promise<void> {
  await archiveCategory(userId, id);
}

export async function savePaymentMethod(
  userId: string,
  input: { id?: string; name: string; sortOrder: number },
): Promise<void> {
  await upsertPaymentMethod({
    id: input.id ?? slugifyName(input.name),
    userId,
    name: input.name.trim(),
    sortOrder: input.sortOrder,
  });
}

export async function hidePaymentMethod(
  userId: string,
  id: string,
): Promise<void> {
  await archivePaymentMethod(userId, id);
}

export async function saveBudget(
  userId: string,
  input: {
    id?: string;
    monthKey: string;
    type: "overall" | "category";
    categoryId?: string;
    amount: number;
  },
): Promise<void> {
  const id =
    input.id ??
    (input.type === "overall"
      ? `overall-${input.monthKey}`
      : `${input.categoryId}-${input.monthKey}`);
  await upsertBudget({
    id,
    userId,
    monthKey: input.monthKey,
    type: input.type,
    categoryId: input.categoryId,
    amount: input.amount,
  });
}

export async function removeBudget(userId: string, id: string): Promise<void> {
  await deleteBudgetRecord(userId, id);
}

export function visibleCategories(
  rows: MoneyCategory[],
  type: TransactionType,
): MoneyCategory[] {
  return rows.filter((row) => {
    if (row.archived) return false;
    return row.kind === "both" || row.kind === type;
  });
}

export function visiblePaymentMethods(rows: PaymentMethod[]): PaymentMethod[] {
  return rows.filter((row) => !row.archived);
}
