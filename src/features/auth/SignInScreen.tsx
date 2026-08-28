"use client";

import { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import { signInWithGoogle } from "@/services/auth";
import { Button } from "@/components/ui/Button";

export function SignInScreen() {
  const configured = isFirebaseConfigured();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-end px-6 pb-16" style={{ paddingTop: "var(--safe-top)" }}>
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Private</p>
      <h1 className="mt-3 text-4xl leading-tight text-ink">Mohamed</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        Owner-only life OS. Google sign-in, then an owner claim, before any data is shown.
      </p>
      <div className="accent-rule mt-8 w-20" />
      <div className="mt-10">
        {configured ? (
          <Button onClick={() => void handleSignIn()} disabled={busy}>
            {busy ? "Opening Google…" : "Continue with Google"}
          </Button>
        ) : (
          <p className="text-sm leading-relaxed text-ink-muted">
            Firebase is not configured. Put your web config in <code className="text-ink">.env.local</code> and restart the
            app.
          </p>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    </main>
  );
}
