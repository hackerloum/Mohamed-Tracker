import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  trailing?: ReactNode;
  action?: ReactNode;
}

export function AppHeader({ title, trailing, action }: AppHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4 pb-6 pt-1">
      <h1 className="text-[32px] font-medium tracking-tight text-ink">{title}</h1>
      {trailing ?? action}
    </header>
  );
}
