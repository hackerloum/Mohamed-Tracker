"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CirclePlus, List, MoreHorizontal, SunMedium, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { isTabActive } from "./BottomNav";
import { useUiStore } from "@/stores/ui";

const tabs = [
  { href: "/today", label: "Today", icon: SunMedium },
  { href: "/log", label: "Log", icon: List },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const;

export function NavRail() {
  const pathname = usePathname();
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col items-center border-r border-hairline py-6 md:flex">
      <span className="mb-8 text-xs tracking-[0.2em] text-accent">M</span>
      <nav className="flex flex-1 flex-col items-center gap-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={tab.label}
              className={cn("flex flex-col items-center gap-1", active ? "text-ink" : "text-ink-muted")}
            >
              <Icon size={18} strokeWidth={1.6} />
              <span className="text-[0.58rem] uppercase tracking-[0.12em]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        aria-label="Quick add"
        onClick={() => openQuickAdd()}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-accent text-accent"
      >
        <CirclePlus size={18} />
      </button>
    </aside>
  );
}
