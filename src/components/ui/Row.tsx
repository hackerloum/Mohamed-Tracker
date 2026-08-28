import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RowProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function Row({ title, meta, trailing, onClick, className }: RowProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        onClick ? "cursor-pointer" : "",
        className,
      )}
    >
      <span>
        <span className="block text-[0.98rem] text-ink">{title}</span>
        {meta ? <span className="mt-0.5 block text-sm text-ink-muted">{meta}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 text-ink-muted">{trailing}</span> : null}
    </div>
  );
}
