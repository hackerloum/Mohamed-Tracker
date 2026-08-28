"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, detail, checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left disabled:opacity-40"
    >
      <span>
        <span className="block text-[0.95rem] text-ink">{label}</span>
        {detail ? <span className="mt-0.5 block text-sm text-ink-muted">{detail}</span> : null}
      </span>
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full border border-hairline transition-colors duration-150",
          checked ? "bg-accent" : "bg-transparent",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-ink transition-transform duration-150",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
