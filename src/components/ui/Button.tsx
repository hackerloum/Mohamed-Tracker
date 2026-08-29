import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "quiet" | "danger" | "hairline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  tone?: "primary" | "ghost" | "quiet";
  children?: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:opacity-90 disabled:opacity-40",
  ghost:
    "bg-transparent text-ink border border-hairline hover:bg-bg-raised disabled:opacity-40",
  quiet: "bg-transparent text-ink-muted hover:text-ink disabled:opacity-40",
  danger: "bg-transparent text-danger hover:bg-bg-raised disabled:opacity-40",
  hairline: "border border-hairline bg-transparent text-ink disabled:opacity-40",
};

export function Button({
  variant,
  tone,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const resolved = variant ?? tone ?? "primary";
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] transition-opacity duration-150 active:opacity-70",
        styles[resolved],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
