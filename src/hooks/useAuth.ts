"use client";

import { createContext, useContext } from "react";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/core/types";

export type AuthStatus = "loading" | "anonymous" | "unauthorized" | "owner";

export interface AuthSnapshot {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
}

export const AuthContext = createContext<AuthSnapshot>({
  status: "loading",
  user: null,
  profile: null,
});

export function useAuth(): AuthSnapshot {
  return useContext(AuthContext);
}
