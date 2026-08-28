"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hairline } from "@/components/ui/Hairline";
import { Screen } from "@/components/ui/Screen";
import { useNotificationsInbox } from "@/hooks/use-notifications";

export function NotificationsInboxScreen() {
  const { rows, loading, error, markRead } = useNotificationsInbox();

  return (
    <Screen>
      <AppHeader title="Inbox" />
      <Hairline accent />
      {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-[14px] text-ink-muted">Loading notices…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No notifications."
          detail="In-app notices appear here when a reminder is due. Push still needs a VAPID key and deployed functions."
        />
      ) : (
        <ul className="mt-4">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-hairline py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                {row.kind}
                {row.read ? "" : " · new"}
              </p>
              <Link
                href={row.payload.url ?? "/today"}
                onClick={() => void markRead(row.id)}
                className="mt-1 block text-[17px] text-ink"
              >
                {row.title}
              </Link>
              {row.body ? <p className="mt-1 text-[14px] text-ink-muted">{row.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
