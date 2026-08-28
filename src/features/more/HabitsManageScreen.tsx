"use client";

import { HabitsScreen } from "@/features/habits/HabitsScreen";
import { useAuth } from "@/hooks/useAuth";
import { useTodayData } from "@/hooks/useTodayData";
import { Screen } from "@/components/ui/Screen";

export function HabitsManageScreen() {
  const { user } = useAuth();
  const data = useTodayData(user?.uid ?? null);
  if (!user) return <Screen />;
  return (
    <Screen>
      <HabitsScreen userId={user.uid} habits={data.habits} />
    </Screen>
  );
}
