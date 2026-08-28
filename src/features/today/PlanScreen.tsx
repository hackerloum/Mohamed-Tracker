"use client";

import { useEffect } from "react";
import { PlanMyDaySheet } from "@/features/today/PlanMyDaySheet";
import { useAuth } from "@/hooks/useAuth";
import { useTodayData } from "@/hooks/useTodayData";
import { useUiStore } from "@/stores/ui";

export function PlanScreen() {
  const { user } = useAuth();
  const data = useTodayData(user?.uid ?? null);
  const openPlan = useUiStore((s) => s.openPlanSheet);

  useEffect(() => {
    openPlan();
  }, [openPlan]);

  if (!user) return null;
  return <PlanMyDaySheet userId={user.uid} data={data} />;
}
