"use client";

import { Delete } from "lucide-react";
import { appendKeypadDigit, backspaceKeypad } from "@/core/money/integer";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export function NumericKeypad({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key, index) => {
        if (key === "") {
          return <div key={`empty-${index}`} />;
        }
        if (key === "del") {
          return (
            <button
              key="del"
              type="button"
              aria-label="Delete"
              onClick={() => onChange(backspaceKeypad(value))}
              className="flex h-[64px] items-center justify-center rounded-2xl text-ink active:bg-bg-raised"
            >
              <Delete size={26} strokeWidth={1.5} />
            </button>
          );
        }
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(appendKeypadDigit(value, key))}
            className="font-serif h-[64px] rounded-2xl text-[28px] tabular-nums text-ink active:bg-bg-raised"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
