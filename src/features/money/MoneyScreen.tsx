"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { MoneyDashboard } from "@/features/money/money-dashboard";
import { useMoneyUiStore } from "@/stores/money-ui-store";

export function MoneyScreen() {
  const openLogger = useMoneyUiStore((state) => state.openLogger);

  return (
    <Screen>
      <AppHeader
        title="Money"
        action={
          <Button variant="quiet" onClick={() => openLogger("expense")}>
            Add
          </Button>
        }
      />
      <MoneyDashboard />
    </Screen>
  );
}
