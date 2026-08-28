import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-hairline bg-bg px-3 py-2.5 text-ink outline-none placeholder:text-ink-muted focus:border-accent ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-hairline bg-bg px-3 py-2.5 text-ink outline-none placeholder:text-ink-muted focus:border-accent ${props.className ?? ""}`}
    />
  );
}
