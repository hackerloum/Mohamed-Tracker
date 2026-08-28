import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Hairline } from "@/components/ui/Hairline";

export function DataSettingsScreen() {
  return (
    <Screen>
      <AppHeader title="Data" />
      <p className="text-sm leading-relaxed text-ink-muted">
        Owner data lives under <code className="text-ink">users/{"{uid}"}</code> in Firestore with offline persistence.
        App Check is not enabled; access is owner-claim plus matching uid in firestore.rules.
      </p>
      <Hairline className="my-6" />
      <p className="text-sm text-ink-muted">Timezone default: Africa/Dar_es_Salaam. Currency: TZS (integer shillings).</p>
    </Screen>
  );
}
