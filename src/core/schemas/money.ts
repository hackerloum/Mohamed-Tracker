import { z } from "zod";

const integerTzs = z.number().int();

export const transactionTypeSchema = z.enum(["expense", "income"]);

export const createTransactionInputSchema = z.object({
  type: transactionTypeSchema,
  amount: integerTzs.positive(),
  currency: z.string().min(1).default("TZS"),
  categoryId: z.string().min(1),
  paymentMethodId: z.string().min(1).optional(),
  description: z.string().trim().max(120).optional(),
  note: z.string().trim().max(280).optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

export const categoryKindSchema = z.enum(["expense", "income", "both"]);

export const upsertCategoryInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(40),
  kind: categoryKindSchema,
  sortOrder: z.number().int().nonnegative(),
});

export type UpsertCategoryInput = z.infer<typeof upsertCategoryInputSchema>;

export const upsertPaymentMethodInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(40),
  sortOrder: z.number().int().nonnegative(),
});

export type UpsertPaymentMethodInput = z.infer<
  typeof upsertPaymentMethodInputSchema
>;

export const budgetTypeSchema = z.enum(["overall", "category"]);

export const upsertBudgetInputSchema = z.object({
  id: z.string().min(1).optional(),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  type: budgetTypeSchema,
  categoryId: z.string().min(1).optional(),
  amount: integerTzs.nonnegative(),
}).superRefine((value, ctx) => {
  if (value.type === "category" && !value.categoryId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "category budgets need a categoryId",
      path: ["categoryId"],
    });
  }
  if (value.type === "overall" && value.categoryId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "overall budgets cannot have a categoryId",
      path: ["categoryId"],
    });
  }
});

export type UpsertBudgetInput = z.infer<typeof upsertBudgetInputSchema>;
