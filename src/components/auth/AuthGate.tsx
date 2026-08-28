"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { AuthContext, type AuthStatus } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import {
  completeGoogleRedirect,
  getOwnerClaim,
  signOut,
  subscribeToAuth,
} from "@/lib/firebase/auth";
import { ensureProfile } from "@/services/profile";
import type { UserProfile } from "@/core/types";
import { Button } from "@/components/ui/Button";

const PUBLIC_PATHS = new Set(["/sign-in", "/offline"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "anonymous",
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    let cancelled = false;
    void completeGoogleRedirect().catch(() => undefined);

    const unsub = subscribeToAuth(async (next) => {
      if (cancelled) return;
      if (!next) {
        setUser(null);
        setProfile(null);
        setStatus("anonymous");
        return;
      }
      setUser(next);
      const owner = await getOwnerClaim(next);
      if (cancelled) return;
      if (!owner) {
        setProfile(null);
        setStatus("unauthorized");
        return;
      }
      try {
        const ensured = await ensureProfile({
          userId: next.uid,
          displayName: next.displayName ?? "Owner",
          email: next.email ?? "owner@local",
          photoUrl: next.photoURL,
        });
        if (!cancelled) {
          setProfile(ensured);
          setStatus("owner");
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setStatus("owner");
        }
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "anonymous" && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/sign-in");
    }
    if (status === "owner" && pathname === "/sign-in") {
      router.replace("/today");
    }
    if (status === "owner" && pathname === "/") {
      router.replace("/today");
    }
  }, [status, pathname, router]);

  const snapshot = useMemo(() => ({ status, user, profile }), [status, user, profile]);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-end bg-bg px-6 pb-16">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-muted">Mohamed</p>
          <div className="accent-rule mt-3 w-16" />
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-end px-6 pb-16">
        <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">Restricted</p>
        <h1 className="mt-3 text-3xl leading-tight text-ink">This account is not authorized.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Sign in with the owner Google account, then run the owner-claim script with your UID.
        </p>
        <div className="mt-8">
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (status === "anonymous" && !PUBLIC_PATHS.has(pathname)) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return <AuthContext.Provider value={snapshot}>{children}</AuthContext.Provider>;
}
