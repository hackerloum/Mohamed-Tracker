function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer number of TZS`);
  }
}

export function percentUsed(spent: number, limit: number): number | null {
  assertInteger(spent, "spent");
  assertInteger(limit, "limit");
  if (limit <= 0) return null;
  return Math.round((spent * 100) / limit);
}

export function budgetProgressCopy(input: {
  spent: number;
  limit: number;
  label: string;
}): string {
  const pct = percentUsed(input.spent, input.limit);
  if (pct === null) return `No ${input.label} budget set.`;
  return `You've used ${pct}% of your ${input.label} budget.`;
}
