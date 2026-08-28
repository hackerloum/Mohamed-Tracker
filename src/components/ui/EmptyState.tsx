"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  detail?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, detail, body, action, className }: EmptyStateProps) {
  const copy = detail ?? body;
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("flex flex-col gap-2 py-10", className)}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.22, bounce: 0.12 }}
    >
      <p className="text-[1.05rem] leading-snug text-ink">{title}</p>
      {copy ? <p className="max-w-prose text-sm leading-relaxed text-ink-muted">{copy}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </motion.div>
  );
}
