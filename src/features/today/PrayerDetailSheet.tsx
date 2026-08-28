"use client";

import { useState } from "react";
import { PRAYER_LABELS, type PrayerEntry, type PrayerKey } from "@/core/types";
import { Sheet } from "@/components/ui/Sheet";
import { savePrayerNote } from "@/services/prayerService";
import { useUiStore } from "@/stores/uiStore";

export function PrayerDetailSheet({
  userId,
  localDate,
  timezone,
  entries,
}: {
  userId: string;
  localDate: string;
  timezone: string;
  entries: PrayerEntry[];
}) {
  const key = useUiStore((state) => state.prayerDetailKey);
  const close = useUiStore((state) => state.closePrayerDetail);
  const prayerKey = isPrayerKey(key) ? key : null;
  const existing = entries.find((entry) => entry.prayerKey === prayerKey) ?? null;

  return (
    <Sheet
      open={Boolean(prayerKey)}
      onOpenChange={(next) => (!next ? close() : undefined)}
      title={prayerKey ? PRAYER_LABELS[prayerKey] : "Prayer"}
    >
      {prayerKey ? (
        <PrayerNoteForm
          key={prayerKey}
          userId={userId}
          prayerKey={prayerKey}
          existing={existing}
          localDate={localDate}
          timezone={timezone}
          onClose={close}
        />
      ) : (
        <p className="text-sm text-mute">Select a prayer.</p>
      )}
    </Sheet>
  );
}

function PrayerNoteForm({
  userId,
  prayerKey,
  existing,
  localDate,
  timezone,
  onClose,
}: {
  userId: string;
  prayerKey: PrayerKey;
  existing: PrayerEntry | null;
  localDate: string;
  timezone: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save(completed: boolean) {
    setError(null);
    try {
      await savePrayerNote({
        userId,
        prayerKey,
        existing,
        localDate,
        timezone,
        note: note.trim() ? note.trim() : null,
        completed,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <>
      <p className="text-sm text-mute">
        Tap on Today marks it complete. This sheet is for a note, not a fake timestamp.
      </p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={4}
        placeholder="Optional note"
        className="mt-4 w-full resize-none bg-transparent text-ivory outline-none placeholder:text-mute"
      />
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void save(true)}
          className="border-b border-bronze py-3 text-left text-bronze"
        >
          Mark complete
        </button>
        <button
          type="button"
          onClick={() => void save(existing?.completed ?? false)}
          className="text-left text-sm text-mute"
        >
          Save note only
        </button>
      </div>
    </>
  );
}

function isPrayerKey(value: string | null): value is PrayerKey {
  return (
    value === "fajr" ||
    value === "dhuhr" ||
    value === "asr" ||
    value === "maghrib" ||
    value === "isha" ||
    value === "tahajjud" ||
    value === "duha" ||
    value === "witr"
  );
}
