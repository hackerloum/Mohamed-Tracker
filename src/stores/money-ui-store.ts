"use client";

import { create } from "zustand";
import type { TransactionType } from "@/core/types/money";

export type LoggerStep = "amount" | "category" | "note";

interface MoneyUiState {
  loggerOpen: boolean;
  loggerType: TransactionType;
  step: LoggerStep;
  digits: string;
  categoryId: string | null;
  paymentMethodId: string | null;
  note: string;
  openLogger: (type?: TransactionType) => void;
  closeLogger: () => void;
  setLoggerType: (type: TransactionType) => void;
  setStep: (step: LoggerStep) => void;
  setDigits: (digits: string) => void;
  setCategoryId: (id: string | null) => void;
  setPaymentMethodId: (id: string | null) => void;
  setNote: (note: string) => void;
  resetLogger: () => void;
}

const initial = {
  loggerOpen: false,
  loggerType: "expense" as TransactionType,
  step: "amount" as LoggerStep,
  digits: "",
  categoryId: null as string | null,
  paymentMethodId: null as string | null,
  note: "",
};

export const useMoneyUiStore = create<MoneyUiState>((set) => ({
  ...initial,
  openLogger: (type = "expense") =>
    set({
      ...initial,
      loggerOpen: true,
      loggerType: type,
    }),
  closeLogger: () => set({ loggerOpen: false }),
  setLoggerType: (loggerType) =>
    set({ loggerType, categoryId: null, step: "amount" }),
  setStep: (step) => set({ step }),
  setDigits: (digits) => set({ digits }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
  setNote: (note) => set({ note }),
  resetLogger: () => set(initial),
}));
