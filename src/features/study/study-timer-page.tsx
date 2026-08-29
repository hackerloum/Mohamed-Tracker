"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatElapsedClock } from "@/core/study/duration";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAppSession } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { Sheet } from "@/components/ui/Sheet";
import { useStudySubjects } from "@/hooks/use-study-subjects";
import { useTimerClock } from "@/hooks/use-timer-clock";
import { ensureStudySubject, logStudySession } from "@/services/study";
import { useStudyTimerStore } from "@/stores/study-timer";

export function StudyTimerPage() {
  const router = useRouter();
  const { userId, timezone } = useAppSession();
  const subjects = useStudySubjects(userId);
  const elapsed = useTimerClock();
  const status = useStudyTimerStore((s) => s.status);
  const start = useStudyTimerStore((s) => s.start);
  const pause = useStudyTimerStore((s) => s.pause);
  const resume = useStudyTimerStore((s) => s.resume);
  const stop = useStudyTimerStore((s) => s.stop);
  const [saveOpen, setSaveOpen] = useState(false);
  const [draft, setDraft] = useState<{
    startedAt: string;
    endedAt: string;
    durationMinutes: number;
  } | null>(null);
  const [topic, setTopic] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finish() {
    const result = stop();
    if (!result) {
      setError("Timer needs to run before it can be saved.");
      return;
    }
    setDraft(result);
    setSaveOpen(true);
  }

  async function save() {
    if (!draft) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let resolvedSubject = subjectId;
      if (!resolvedSubject && newSubject.trim()) {
        const created = await ensureStudySubject(userId, newSubject.trim());
        resolvedSubject = created.id;
      }
      await logStudySession({
        userId,
        timezone,
        topic: topic.trim() || newSubject.trim() || "Study",
        subjectId: resolvedSubject,
        notes: notes.trim() ? notes.trim() : null,
        startedAt: draft.startedAt,
        endedAt: draft.endedAt,
      });
      setSaveOpen(false);
      router.push("/study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <AppHeader title="Timer" />
      <div className="flex flex-col items-center px-5 pt-10">
        <p className="tabular text-7xl tracking-tight">{formatElapsedClock(elapsed)}</p>
        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-ink-muted">
          {status === "idle" ? "Ready" : status}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {status === "idle" ? (
            <Button onClick={start}>Start study</Button>
          ) : null}
          {status === "running" ? (
            <>
              <Button tone="quiet" onClick={pause}>
                Pause
              </Button>
              <Button onClick={finish}>Save</Button>
            </>
          ) : null}
          {status === "paused" ? (
            <>
              <Button tone="quiet" onClick={resume}>
                Resume
              </Button>
              <Button onClick={finish}>Save</Button>
            </>
          ) : null}
        </div>
        {error && !saveOpen ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>

      <Sheet open={saveOpen} onOpenChange={setSaveOpen} title="Save session">
        <div className="space-y-4 pb-4">
          <p className="tabular text-ink-muted">
            {draft ? `${draft.durationMinutes} min` : null}
          </p>
          <Field label="Topic / subject / project">
            <TextInput
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Arabic grammar"
            />
          </Field>
          {subjects.length > 0 ? (
            <Field label="Saved subject">
              <select
                value={subjectId ?? ""}
                onChange={(e) => setSubjectId(e.target.value || null)}
                className="w-full rounded-lg border border-hairline bg-bg px-3 py-2.5"
              >
                <option value="">None</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field label="New subject">
            <TextInput
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Notes">
            <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button onClick={() => void save()} disabled={busy || !draft}>
            {busy ? "Saving…" : "Save session"}
          </Button>
        </div>
      </Sheet>
    </main>
  );
}
