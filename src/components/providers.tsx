"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthGate>{children}</AuthGate>
    </ThemeProvider>
  );
}
