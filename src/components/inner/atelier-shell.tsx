"use client";

import { Geist } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

interface AtelierShellProps {
  kicker: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function AtelierShell({
  kicker,
  title,
  children,
  action,
}: AtelierShellProps) {
  return (
    <div className={`${geist.className} atelier-shell px-5`}>
      <header className="flex items-end justify-between gap-4 pb-8">
        <div>
          <p className="text-[0.7rem] tracking-[0.18em] text-[var(--atelier-muted)] uppercase">
            {kicker}
          </p>
          <h1 className="mt-2 text-[2rem] font-medium leading-none tracking-tight">
            {title}
          </h1>
        </div>
        {action}
      </header>
      {children}
      <nav className="mt-16 flex gap-6 text-sm text-[var(--atelier-muted)]">
        <Link href="/today/reflection" className="underline-offset-4 hover:text-[var(--atelier-ink)] hover:underline">
          Tonight
        </Link>
        <Link href="/more/goals" className="underline-offset-4 hover:text-[var(--atelier-ink)] hover:underline">
          Goals
        </Link>
      </nav>
    </div>
  );
}
