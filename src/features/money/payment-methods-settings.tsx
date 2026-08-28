"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import { hidePaymentMethod, savePaymentMethod } from "@/services/money-service";

export function PaymentMethodsSettings() {
  const { user } = useAuth();
  const { paymentMethods, error } = useMoneyCatalog();
  const [name, setName] = useState("");
  const visible = paymentMethods.filter((row) => !row.archived);

  return (
    <div>
      <p className="mb-6 text-[14px] text-[var(--atelier-muted)]">
        Cash, mobile money, bank, card. Archive hides a method without deleting history.
      </p>
      {error ? <p className="mb-3 text-[14px] text-red-400">{error}</p> : null}
      <ul className="divide-y divide-[var(--atelier-hairline)]">
        {visible.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-3">
            <p className="text-[16px] text-[var(--atelier-text)]">{row.name}</p>
            <button
              type="button"
              className="text-[13px] text-[var(--atelier-muted)]"
              onClick={() => {
                if (!user) return;
                void hidePaymentMethod(user.uid, row.id);
              }}
            >
              Archive
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="py-6 text-[15px] text-[var(--atelier-muted)]">
          No payment methods yet.
        </p>
      ) : null}

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!user || name.trim().length === 0) return;
          void savePaymentMethod(user.uid, {
            name: name.trim(),
            sortOrder: visible.length,
          }).then(() => setName(""));
        }}
      >
        <label className="block text-[13px] text-[var(--atelier-muted)]">
          New payment method
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full border-b border-[var(--atelier-hairline)] bg-transparent py-2 text-[17px] text-[var(--atelier-text)] outline-none"
          />
        </label>
        <Button type="submit">Add payment method</Button>
      </form>
    </div>
  );
}
