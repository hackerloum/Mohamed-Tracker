"use client";

import { useEffect, useState } from "react";

export type SyncState = "online" | "offline";

export function useNetworkStatus(): SyncState {
  const [status, setStatus] = useState<SyncState>("online");

  useEffect(() => {
    let delay: number | undefined;
    const apply = () => {
      if (navigator.onLine) {
        if (delay !== undefined) window.clearTimeout(delay);
        delay = undefined;
        setStatus("online");
        return;
      }
      delay = window.setTimeout(() => setStatus("offline"), 1800);
    };
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);
    const initial = window.setTimeout(apply, 0);
    return () => {
      window.clearTimeout(initial);
      if (delay !== undefined) window.clearTimeout(delay);
      window.removeEventListener("online", apply);
      window.removeEventListener("offline", apply);
    };
  }, []);

  return status;
}
