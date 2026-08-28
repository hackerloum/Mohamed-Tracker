import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  trailing?: ReactNode;
  action?: ReactNode;
}

export function AppHeader({ title, trailing, action }: AppHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4 pb-4 pt-2">
      <h1 className="text-2xl font-medium tracking-tight text-ink">{title}</h1>
      {trailing ?? action}
    </header>
  );
}
