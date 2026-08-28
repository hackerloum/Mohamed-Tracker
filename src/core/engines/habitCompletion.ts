export function applyHabitTap(
  currentCount: number | null,
  targetCount: number,
): { count: number; completed: boolean } {
  const current = currentCount ?? 0;
  const next = Math.min(current + 1, targetCount);
  return {
    count: next,
    completed: next >= targetCount,
  };
}
