"use client";

import { useMemo } from "react";
import { DEFAULT_TIMEZONE } from "@/core/dates/localDate";
import { useAuth } from "@/hooks/useAuth";
import {
  createInnerServices,
  resolveInnerBackend,
  type InnerBackend,
  type InnerServices,
} from "@/services/inner";

export interface InnerSession {
  status: "loading" | "ready";
  userId: string;
  timezone: string;
  backend: InnerBackend;
  signedIn: boolean;
  services: InnerServices;
}

export function useInnerSession(): InnerSession {
  const { status, user, profile } = useAuth();
  const services = useMemo(() => createInnerServices(), []);
  const backend = resolveInnerBackend();
  const userId = user?.uid ?? (backend === "memory" ? "local-owner" : "");
  const ready = status !== "loading" || backend === "memory";

  return {
    status: ready ? "ready" : "loading",
    userId,
    timezone: profile?.timezone ?? DEFAULT_TIMEZONE,
    backend,
    signedIn: Boolean(user),
    services,
  };
}
