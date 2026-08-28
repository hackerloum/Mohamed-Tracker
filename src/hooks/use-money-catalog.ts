"use client";

import { useEffect, useRef, useState } from "react";
import type { MoneyCategory, PaymentMethod } from "@/core/types/money";
import { listenCategories } from "@/repositories/categories";
import { listenPaymentMethods } from "@/repositories/payment-methods";
import { ensureMoneyDefaults } from "@/services/money-service";
import { useAuth } from "./use-auth";

export function useMoneyCatalog() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MoneyCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!user) return;
    const stopCategories = listenCategories(
      user.uid,
      (rows) => {
        setCategories(rows);
        setLoading(false);
        if (rows.length === 0 && !seeded.current) {
          seeded.current = true;
          void ensureMoneyDefaults(user.uid).catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Could not seed defaults.");
          });
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    const stopMethods = listenPaymentMethods(
      user.uid,
      (rows) => {
        setPaymentMethods(rows);
        if (rows.length === 0 && !seeded.current) {
          seeded.current = true;
          void ensureMoneyDefaults(user.uid).catch((err: unknown) => {
            setError(
              err instanceof Error ? err.message : "Could not seed defaults.",
            );
          });
        }
      },
      (err) => setError(err.message),
    );
    return () => {
      stopCategories();
      stopMethods();
    };
  }, [user]);

  return { categories, paymentMethods, loading, error };
}
