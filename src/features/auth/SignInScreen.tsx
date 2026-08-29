"use client";

import { useMemo, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import { signInWithGoogle } from "@/services/auth";
import { Button } from "@/components/ui/Button";

export function SignInScreen() {
  const configured = isFirebaseConfigured();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="app-canvas mx-auto flex min-h-dvh max-w-lg flex-col justify-between px-6 pb-16"
      style={{ paddingTop: "calc(var(--safe-top) + 2.5rem)" }}
    >
      <div>
        <p className="text-[14px] text-ink-muted">{today}</p>
        <h1 className="font-serif mt-6 text-[64px] leading-[0.88] tracking-[-0.03em] text-ink">
          Mohamed
        </h1>
      </div>
      <div>
        <p className="max-w-[15rem] text-[18px] leading-relaxed text-ink-muted">
          What should I do today, what have I done, how am I doing.
        </p>
        <div className="mt-10">
          {configured ? (
            <Button onClick={() => void handleSignIn()} disabled={busy} className="w-full">
              {busy ? "Opening Google…" : "Continue with Google"}
            </Button>
          ) : (
            <p className="text-[15px] leading-relaxed text-ink-muted">
              Add Firebase config in <code className="text-ink">.env.local</code> and restart.
            </p>
          )}
          {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
