"use client";

import { useState } from "react";
import { localDateKey } from "@/core/dates/localDate";
import { parseKeypadDigits } from "@/core/money/integer";
import { DEFAULT_TIMEZONE } from "@/core/types/money";
import { AmountDisplay } from "@/components/money/amount-display";
import {
  CategoryPicker,
  PaymentMethodStrip,
} from "@/components/money/category-picker";
import { NumericKeypad } from "@/components/money/numeric-keypad";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";
import { useAuth } from "@/hooks/use-auth";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import { logTransaction, visibleCategories, visiblePaymentMethods } from "@/services/money-service";
import { useMoneyUiStore } from "@/stores/money-ui-store";

export function TransactionLogger() {
  const { user } = useAuth();
  const { categories, paymentMethods } = useMoneyCatalog();
  const store = useMoneyUiStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseKeypadDigits(store.digits);
  const cats = visibleCategories(categories, store.loggerType);
  const methods = visiblePaymentMethods(paymentMethods);
  const selectedCategory = cats.find((row) => row.id === store.categoryId);

  async function save() {
    if (!user || !selectedCategory) return;
    setSaving(true);
    setError(null);
    try {
      await logTransaction({
        userId: user.uid,
        type: store.loggerType,
        amount,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        paymentMethodId: store.paymentMethodId ?? methods[0]?.id,
        note: store.note.trim() || undefined,
        localDate: localDateKey(new Date(), DEFAULT_TIMEZONE),
        timezone: DEFAULT_TIMEZONE,
      });
      store.resetLogger();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={store.loggerOpen}
      onOpenChange={(open) => {
        if (!open) store.closeLogger();
      }}
    >
      <SheetContent>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[18px] text-[var(--atelier-text)]">
              {store.loggerType === "expense" ? "Expense" : "Income"}
            </SheetTitle>
            <button
              type="button"
              className="text-[13px] text-[var(--atelier-accent)]"
              onClick={() =>
                store.setLoggerType(
                  store.loggerType === "expense" ? "income" : "expense",
                )
              }
            >
              Switch to {store.loggerType === "expense" ? "income" : "expense"}
            </button>
          </div>
          <SheetDescription className="sr-only">
            Amount, then category, then an optional note.
          </SheetDescription>

          {store.step === "amount" ? (
            <>
              <AmountDisplay digits={store.digits} />
              <NumericKeypad value={store.digits} onChange={store.setDigits} />
              <Button
                disabled={amount <= 0}
                onClick={() => store.setStep("category")}
                className="w-full"
              >
                Continue
              </Button>
            </>
          ) : null}

          {store.step === "category" ? (
            <>
              <AmountDisplay digits={store.digits} />
              <PaymentMethodStrip
                methods={methods}
                selectedId={store.paymentMethodId ?? methods[0]?.id ?? null}
                onSelect={store.setPaymentMethodId}
              />
              <CategoryPicker
                categories={cats}
                selectedId={store.categoryId}
                onSelect={store.setCategoryId}
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => store.setStep("amount")}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!store.categoryId}
                  onClick={() => store.setStep("note")}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : null}

          {store.step === "note" ? (
            <>
              <AmountDisplay digits={store.digits} />
              <p className="text-[14px] text-[var(--atelier-muted)]">
                {selectedCategory?.name ?? "Category"}
              </p>
              <label className="block text-[13px] text-[var(--atelier-muted)]">
                Note
                <input
                  value={store.note}
                  onChange={(event) => store.setNote(event.target.value)}
                  placeholder="Lunch"
                  maxLength={280}
                  className="mt-2 w-full border-b border-[var(--atelier-hairline)] bg-transparent py-2 text-[17px] text-[var(--atelier-text)] outline-none placeholder:text-[var(--atelier-muted)]"
                />
              </label>
              {error ? (
                <p className="text-[13px] text-red-400">{error}</p>
              ) : null}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => store.setStep("category")}>
                  Back
                </Button>
                <Button className="flex-1" disabled={saving} onClick={() => void save()}>
                  {saving ? "Saving" : "Save"}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
