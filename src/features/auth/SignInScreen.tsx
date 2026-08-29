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
    <main
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-6 pb-20"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-accent">Private</p>
      <h1 className="mt-4 text-[52px] font-medium leading-[0.92] tracking-tight text-ink">
        Mohamed
      </h1>
      <p className="mt-5 max-w-[16rem] text-[17px] leading-relaxed text-ink-muted">
        Your day, in one place.
      </p>
      <div className="mt-12 h-px w-16 bg-accent" />
      <div className="mt-10">
        {configured ? (
          <Button onClick={() => void handleSignIn()} disabled={busy} className="w-full">
            {busy ? "Opening Google…" : "Continue with Google"}
          </Button>
        ) : (
          <p className="text-[15px] leading-relaxed text-ink-muted">
            Firebase is not configured yet. Add your web config to{" "}
            <code className="text-ink">.env.local</code> and restart.
          </p>
        )}
        {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      </div>
    </main>
  );
}
