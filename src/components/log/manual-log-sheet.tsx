"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MANUAL_LOG_KINDS, MANUAL_LOG_LABELS, type ManualLogKind } from "@/core/types/log";
import { hrefForManualLogKind } from "@/core/activity/mapping";
import { logGenericActivity, logNote } from "@/services/manual-log";
import { useLogSheetStore } from "@/stores/log-sheet";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { Sheet } from "@/components/ui/Sheet";

export function ManualLogSheet({
  userId,
  timezone,
}: {
  userId: string;
  timezone: string;
}) {
  const router = useRouter();
  const open = useLogSheetStore((s) => s.open);
  const kind = useLogSheetStore((s) => s.kind);
  const openSheet = useLogSheetStore((s) => s.openSheet);
  const closeSheet = useLogSheetStore((s) => s.closeSheet);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inForm = kind === "note" || kind === "activity" || kind === "custom";

  async function saveOwned() {
    setBusy(true);
    setError(null);
    try {
      if (kind === "note") {
        await logNote({ userId, timezone, body });
      } else if (kind === "activity" || kind === "custom") {
        await logGenericActivity({
          userId,
          timezone,
          type: kind,
          title,
          notes: body.trim() ? body : null,
        });
      }
      setTitle("");
      setBody("");
      closeSheet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  function selectKind(next: ManualLogKind) {
    const href = hrefForManualLogKind(next);
    if (href) {
      closeSheet();
      router.push(href);
      return;
    }
    openSheet(next);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? openSheet(kind ?? undefined) : closeSheet())}
      title={inForm && kind ? MANUAL_LOG_LABELS[kind] : "Log something"}
    >
      {!inForm ? (
        <div className="grid grid-cols-2 gap-2 pb-4">
          {MANUAL_LOG_KINDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectKind(item)}
              className="rounded-xl border border-hairline bg-bg px-3 py-4 text-left text-sm tracking-wide hover:border-accent"
            >
              {MANUAL_LOG_LABELS[item]}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {kind !== "note" ? (
            <Field label="Title">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === "custom" ? "What happened?" : "Activity"}
              />
            </Field>
          ) : null}
          <Field label={kind === "note" ? "Note" : "Notes"}>
            <TextArea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Optional detail"
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-2">
            <Button tone="ghost" onClick={() => openSheet()} disabled={busy}>
              Back
            </Button>
            <Button onClick={() => void saveOwned()} disabled={busy || (kind === "note" ? !body.trim() : !title.trim())}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
