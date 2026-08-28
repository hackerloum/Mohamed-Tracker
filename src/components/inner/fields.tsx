"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function FieldLabel({ children }: { children: string }) {
  return (
    <label className="block text-sm text-[var(--atelier-muted)]">{children}</label>
  );
}

export function TextField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        {...props}
        className="mt-2 w-full border-0 border-b border-[var(--atelier-line)] bg-transparent py-2 text-[var(--atelier-ink)] outline-none placeholder:text-[var(--atelier-muted)]/60 focus:border-[var(--atelier-accent)]"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...props}
        className="mt-2 w-full resize-none border-0 border-b border-[var(--atelier-line)] bg-transparent py-2 text-[var(--atelier-ink)] outline-none placeholder:text-[var(--atelier-muted)]/60 focus:border-[var(--atelier-accent)]"
      />
    </div>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        {...props}
        className="mt-2 w-full border-0 border-b border-[var(--atelier-line)] bg-transparent py-2 text-[var(--atelier-ink)] outline-none focus:border-[var(--atelier-accent)]"
      >
        {children}
      </select>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: { children: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...props}
      className="w-full border-b border-[var(--atelier-accent)] py-3 text-left text-sm tracking-wide text-[var(--atelier-ink)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}
