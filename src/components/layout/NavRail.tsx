"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, MoreHorizontal, Plus, Sun, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { isTabActive } from "./BottomNav";
import { useUiStore } from "@/stores/ui";

const tabs = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/log", label: "Log", icon: List },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const;

export function NavRail() {
  const pathname = usePathname();
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[4.5rem] shrink-0 flex-col items-center border-r border-hairline py-7 md:flex">
      <span className="font-serif mb-10 text-[22px] text-ink">M</span>
      <nav className="flex flex-1 flex-col items-center gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={tab.label}
              className={cn(active ? "text-ink" : "text-ink-muted")}
            >
              <Icon size={20} strokeWidth={active ? 1.9 : 1.5} />
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        aria-label="Add"
        onClick={() => openQuickAdd()}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg"
      >
        <Plus size={16} strokeWidth={2.2} />
      </button>
    </aside>
  );
}
