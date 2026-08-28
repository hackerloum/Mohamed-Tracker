import { Screen } from "@/components/ui/Screen";

export function OfflineScreen() {
  return (
    <Screen>
      <div className="flex min-h-[70dvh] flex-col justify-end pb-8">
        <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">Offline</p>
        <h1 className="mt-3 text-3xl text-ink">The app shell is cached. Live data needs a connection.</h1>
      </div>
    </Screen>
  );
}
