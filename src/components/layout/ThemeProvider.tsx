"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => {
      root.classList.toggle("dark", dark);
    };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (event: MediaQueryListEvent) => apply(event.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(theme === "dark");
    return undefined;
  }, [theme]);

  return children;
}
