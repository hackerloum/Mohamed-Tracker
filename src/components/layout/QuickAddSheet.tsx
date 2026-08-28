"use client";

import { QuickAddSheet as TodayQuickAdd } from "@/features/today/QuickAddSheet";
import { useAuth } from "@/hooks/useAuth";
import { useTodayData } from "@/hooks/useTodayData";
import { useUiStore } from "@/stores/ui";
import { Sheet } from "@/components/ui/Sheet";
import { Hairline } from "@/components/ui/Hairline";
import { useLogSheetStore } from "@/stores/log-sheet";
import Link from "next/link";

export function QuickAddSheet() {
  const { user } = useAuth();
  const data = useTodayData(user?.uid ?? null);
  const kind = useUiStore((s) => s.quickAddKind);

  if (user && (kind === "task" || kind === "habit" || kind === "note")) {
    return (
      <TodayQuickAdd
        userId={user.uid}
        localDate={data.localDate}
        timezone={data.timezone}
        habitCount={data.habits.length}
      />
    );
  }

  return <QuickAddFallback />;
}

function QuickAddFallback() {
  const open = useUiStore((s) => s.quickAddOpen);
  const close = useUiStore((s) => s.closeQuickAdd);
  const openLog = useLogSheetStore((s) => s.openSheet);

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? undefined : close())} title="Quick add">
      <ul>
        <li>
          <Link href="/today/plan" onClick={close} className="block py-3 text-[1.05rem] text-ink">
            Task
          </Link>
          <Hairline />
        </li>
        <li>
          <Link href="/more/habits" onClick={close} className="block py-3 text-[1.05rem] text-ink">
            Habit
          </Link>
          <Hairline />
        </li>
        <li>
          <Link href="/money" onClick={close} className="block py-3 text-[1.05rem] text-ink">
            Expense
          </Link>
          <Hairline />
        </li>
        <li>
          <Link href="/study/start" onClick={close} className="block py-3 text-[1.05rem] text-ink">
            Study
          </Link>
          <Hairline />
        </li>
        <li>
          <Link href="/workout" onClick={close} className="block py-3 text-[1.05rem] text-ink">
            Workout
          </Link>
          <Hairline />
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              close();
              openLog();
            }}
            className="block w-full py-3 text-left text-[1.05rem] text-ink"
          >
            Log something
          </button>
        </li>
      </ul>
    </Sheet>
  );
}
