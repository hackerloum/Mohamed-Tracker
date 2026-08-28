import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextInput({ label, className, id, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="flex flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-xs uppercase tracking-[0.14em] text-ink-muted">{label}</span>
      <input
        id={inputId}
        className={cn(
          "border-0 border-b border-hairline bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-muted focus:border-accent",
          className,
        )}
        {...props}
      />
    </label>
  );
}
