"use client";

import { useEffect, useState } from "react";
import { listenTransactionsInRange } from "@/repositories/transactions";
import type { Transaction } from "@/core/types/money";
import { useAuth } from "./use-auth";

export function useTransactions(range: { start: string; end: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = listenTransactionsInRange(
      user.uid,
      range.start,
      range.end,
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
  }, [user, range.start, range.end]);

  return { rows, loading, error };
}
