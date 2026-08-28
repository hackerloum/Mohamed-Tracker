"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_SCORE_WEIGHTS } from "@/core/types/user";
import { updateProfile } from "@/services/profile";
import { useState } from "react";

export function ScoreSettingsScreen() {
  const { profile, user } = useAuth();
  const initial = profile?.scoreWeights ?? DEFAULT_SCORE_WEIGHTS;
  const [weights, setWeights] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!user) return;
    await updateProfile(user.uid, { scoreWeights: weights });
    setSaved(true);
  }

  return (
    <Screen>
      <AppHeader title="Score weights" />
      <p className="mb-6 text-sm text-ink-muted">
        Integers only. The daily score engine is stubbed until Wave B, but these values persist.
      </p>
      {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
        <div key={key} className="mb-4">
          <TextInput
            label={key}
            inputMode="numeric"
            value={String(weights[key])}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              setWeights((current) => ({
                ...current,
                [key]: Number.isInteger(parsed) ? parsed : 0,
              }));
              setSaved(false);
            }}
          />
        </div>
      ))}
      <Button variant="ghost" onClick={() => void save()} disabled={!user}>
        {saved ? "Saved" : "Save weights"}
      </Button>
    </Screen>
  );
}
