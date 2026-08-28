export const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Business",
  "Entertainment",
  "Family",
  "Health",
  "Education",
  "Motorcycle / Car",
  "Other",
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Gift",
  "Other",
] as const;

export const DEFAULT_PAYMENT_METHODS = [
  "Cash",
  "M-Pesa",
  "Airtel Money",
  "Mixx by Yas",
  "Bank",
  "Card",
  "Other",
] as const;

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
