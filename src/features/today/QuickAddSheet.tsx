"use client";

import { useState } from "react";
import { createHabitSchema, createNoteSchema, createTaskSchema } from "@/core/schemas/waveB";
import { Sheet } from "@/components/ui/Sheet";
import { createHabit } from "@/services/habitService";
import { createNote } from "@/services/noteService";
import { createTask } from "@/services/taskService";
import { useUiStore, type QuickAddKind } from "@/stores/uiStore";
import type { HabitTargetCount } from "@/core/types";

const kinds: QuickAddKind[] = ["task", "habit", "note"];

export function QuickAddSheet({
  userId,
  localDate,
  timezone,
  habitCount,
}: {
  userId: string;
  localDate: string;
  timezone: string;
  habitCount: number;
}) {
  const open = useUiStore((state) => state.quickAddOpen);
  const kind = useUiStore((state) => state.quickAddKind);
  const close = useUiStore((state) => state.closeQuickAdd);
  const setKind = useUiStore((state) => state.setQuickAddKind);
  const [text, setText] = useState("");
  const [targetCount, setTargetCount] = useState<HabitTargetCount>(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      if (kind === "task") {
        const parsed = createTaskSchema.parse({ title: text, priority: false });
        await createTask({
          userId,
          title: parsed.title,
          localDate,
          timezone,
          priority: false,
        });
      } else if (kind === "habit") {
        const parsed = createHabitSchema.parse({ name: text, targetCount });
        await createHabit({
          userId,
          name: parsed.name,
          targetCount: parsed.targetCount,
          sortOrder: habitCount,
        });
      } else {
        const parsed = createNoteSchema.parse({ body: text });
        await createNote({
          userId,
          body: parsed.body,
          localDate,
          timezone,
        });
      }
      setText("");
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? close() : undefined)} title="Quick add">
      <div className="mb-4 flex gap-4">
        {kinds.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            className={`text-sm capitalize ${item === kind ? "text-bronze" : "text-mute"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={kind === "note" ? 5 : 2}
        placeholder={kind === "habit" ? "Habit name" : kind === "task" ? "Task title" : "Note"}
        className="w-full resize-none bg-transparent text-lg text-ivory outline-none placeholder:text-mute"
      />
      {kind === "habit" ? (
        <div className="mt-4 flex gap-3">
          {([1, 2, 3] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setTargetCount(count)}
              className={`text-sm ${targetCount === count ? "text-bronze" : "text-mute"}`}
            >
              {count} tap{count === 1 ? "" : "s"}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={saving}
        className="mt-6 w-full border-b border-bronze py-3 text-left text-bronze"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </Sheet>
  );
}
