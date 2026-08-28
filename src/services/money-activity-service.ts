import { formatTzs } from "@/core/money/integer";
import type { TransactionType } from "@/core/types/money";
import { upsertActivity } from "@/repositories/activities";

export async function emitMoneyActivity(input: {
  userId: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  categoryName: string;
  localDate: string;
  timezone: string;
  note?: string;
}): Promise<void> {
  const title =
    input.type === "expense"
      ? `Spent ${formatTzs(input.amount, { withCode: true })} on ${input.categoryName}`
      : `Received ${formatTzs(input.amount, { withCode: true })} · ${input.categoryName}`;

  await upsertActivity(`txn-${input.transactionId}`, {
    userId: input.userId,
    type: input.type,
    localDate: input.localDate,
    timezone: input.timezone,
    title,
    summary: input.note,
    relatedId: input.transactionId,
    sourceCollection: "transactions",
    amount: input.amount,
    occurredAt: new Date().toISOString(),
  });
}
