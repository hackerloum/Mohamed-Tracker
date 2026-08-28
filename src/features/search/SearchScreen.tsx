"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { TextInput } from "@/components/ui/TextInput";
import { useLifeSearch } from "@/hooks/use-insights";

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const { hits, loading, error } = useLifeSearch(query);
  const trimmed = query.trim();

  return (
    <Screen>
      <AppHeader title="Search" />
      <TextInput
        label="Query"
        placeholder="gym, food, 50000, cybersecurity, Fajr"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
      />
      {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      {!trimmed ? (
        <EmptyState
          title="Type to search."
          detail="Looks through activities, transactions, notes, habits, prayers, and study from the last 90 days."
        />
      ) : loading ? (
        <p className="mt-6 text-[14px] text-ink-muted">Searching…</p>
      ) : hits.length === 0 ? (
        <EmptyState
          title="No matches."
          detail={`Nothing stored matches “${trimmed}”.`}
        />
      ) : (
        <ul className="mt-6">
          {hits.map((hit) => (
            <li key={hit.id} className="border-t border-hairline py-3 first:border-t-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                {hit.kind}
                <span className="ml-2 font-mono normal-case tracking-normal tabular-nums">
                  {hit.localDate}
                </span>
              </p>
              <Link href={hit.href} className="mt-1 block text-[17px] leading-snug text-ink">
                {hit.title}
              </Link>
              {hit.detail ? <p className="mt-1 text-[13px] text-ink-muted">{hit.detail}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
