"use client";

import { DEFAULT_TIMEZONE } from "@/core/dates/localDate";
import { useAuth } from "@/hooks/useAuth";

export function useAppSession() {
  const { user, profile } = useAuth();
  return {
    userId: user?.uid ?? "",
    timezone: profile?.timezone ?? DEFAULT_TIMEZONE,
    user,
    profile,
  };
}
