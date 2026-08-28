"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import { hideCategory, saveCategory } from "@/services/money-service";
import type { MoneyCategory } from "@/core/types/money";

export function CategoriesSettings() {
  const { user } = useAuth();
  const { categories, error } = useMoneyCatalog();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<MoneyCategory["kind"]>("expense");

  const visible = categories.filter((row) => !row.archived);

  return (
    <div>
      <p className="mb-6 text-[14px] text-[var(--atelier-muted)]">
        Used when logging expenses and income. Archive hides a category without deleting history.
      </p>
      {error ? <p className="mb-3 text-[14px] text-red-400">{error}</p> : null}
      <ul className="divide-y divide-[var(--atelier-hairline)]">
        {visible.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-[16px] text-[var(--atelier-text)]">{row.name}</p>
              <p className="text-[12px] text-[var(--atelier-muted)]">{row.kind}</p>
            </div>
            <button
              type="button"
              className="text-[13px] text-[var(--atelier-muted)]"
              onClick={() => {
                if (!user) return;
                void hideCategory(user.uid, row.id);
              }}
            >
              Archive
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="py-6 text-[15px] text-[var(--atelier-muted)]">
          No categories yet.
        </p>
      ) : null}

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!user || name.trim().length === 0) return;
          void saveCategory(user.uid, {
            name: name.trim(),
            kind,
            sortOrder: visible.length,
          }).then(() => setName(""));
        }}
      >
        <label className="block text-[13px] text-[var(--atelier-muted)]">
          New category
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full border-b border-[var(--atelier-hairline)] bg-transparent py-2 text-[17px] text-[var(--atelier-text)] outline-none"
          />
        </label>
        <div className="flex gap-3 text-[13px]">
          {(["expense", "income", "both"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={
                kind === value
                  ? "text-[var(--atelier-accent)]"
                  : "text-[var(--atelier-muted)]"
              }
            >
              {value}
            </button>
          ))}
        </div>
        <Button type="submit">Add category</Button>
      </form>
    </div>
  );
}
