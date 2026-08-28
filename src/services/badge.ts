export async function syncAppBadge(count: number): Promise<void> {
  if (typeof navigator === "undefined") return;
  const withBadge = navigator as Navigator & {
    setAppBadge?: (value: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    if (count <= 0) {
      await withBadge.clearAppBadge?.();
      return;
    }
    await withBadge.setAppBadge?.(count);
  } catch {
    // Badge API is best-effort on iOS PWA.
  }
}
