"use client";

import type { Scale1to5 } from "@/core/types/sleep";

interface ScalePickerProps {
  label: string;
  value?: Scale1to5;
  onChange: (value: Scale1to5 | undefined) => void;
  optional?: boolean;
}

const VALUES: Scale1to5[] = [1, 2, 3, 4, 5];

export function ScalePicker({
  label,
  value,
  onChange,
  optional = false,
}: ScalePickerProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm text-[var(--atelier-muted)]">{label}</legend>
      <div className="mt-3 flex gap-2">
        {VALUES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(selected && optional ? undefined : n)}
              className={`tabular h-10 w-10 rounded-full text-sm transition-colors ${
                selected
                  ? "bg-[var(--atelier-ink)] text-[var(--atelier-bg)]"
                  : "text-[var(--atelier-ink)] ring-1 ring-[var(--atelier-line)]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
