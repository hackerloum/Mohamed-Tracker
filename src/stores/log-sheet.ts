import { create } from "zustand";
import type { ManualLogKind } from "@/core/types/log";

interface LogSheetState {
  open: boolean;
  kind: ManualLogKind | null;
  openSheet: (kind?: ManualLogKind | null) => void;
  closeSheet: () => void;
}

export const useLogSheetStore = create<LogSheetState>((set) => ({
  open: false,
  kind: null,
  openSheet: (kind = null) => set({ open: true, kind: kind ?? null }),
  closeSheet: () => set({ open: false, kind: null }),
}));
