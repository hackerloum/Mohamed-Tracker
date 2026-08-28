"use client";

import { useEffect, useState } from "react";
import type { Budget } from "@/core/types/money";
import { listenBudgetsForMonth } from "@/repositories/budgets";
import { useAuth } from "./use-auth";

export function useBudgets(monthKey: string) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = listenBudgetsForMonth(
      user.uid,
      monthKey,
      (next) => {
        setRows(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [user, monthKey]);

  return { rows, loading, error };
}
