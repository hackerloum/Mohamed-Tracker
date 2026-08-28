export type TransactionKind = "expense" | "income";
export type TransactionType = TransactionKind;

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  kind: TransactionKind;
  amount: number;
  currency: string;
  categoryId: string;
  paymentMethodId?: string;
  description?: string;
  note?: string;
  localDate: string;
  timezone: string;
  occurredAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  kind: "expense" | "income" | "both";
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MoneyCategory = Category;

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetType = "overall" | "category";

export interface Budget {
  id: string;
  userId: string;
  monthKey: string;
  type: BudgetType;
  categoryId?: string;
  amount: number;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NamedAmount {
  id: string;
  amount: number;
}

export interface DailyAmount {
  localDate: string;
  amount: number;
}

export interface MoneySummary {
  spent: number;
  income: number;
  net: number;
  biggestExpense: Transaction | null;
  byCategory: NamedAmount[];
  byPaymentMethod: NamedAmount[];
  dailySpend: DailyAmount[];
}

export interface DateRange {
  start: string;
  end: string;
}

export const DEFAULT_CURRENCY = "TZS";
export const DEFAULT_TIMEZONE = "Africa/Dar_es_Salaam";
