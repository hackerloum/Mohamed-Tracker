"use client";

import { useAuth as useOwnerAuth } from "@/hooks/useAuth";

export function useAuth() {
  const snapshot = useOwnerAuth();
  return {
    ...snapshot,
    user: snapshot.user,
    ready: snapshot.status !== "loading",
    configured: snapshot.status !== "anonymous" || Boolean(snapshot.user),
    isOwner: snapshot.status === "owner" ? true : snapshot.status === "unauthorized" ? false : null,
    error: null as string | null,
  };
}
