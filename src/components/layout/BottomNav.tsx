"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CirclePlus, List, MoreHorizontal, SunMedium, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui";

const tabs = [
  { href: "/today", label: "Today", icon: SunMedium },
  { href: "/log", label: "Log", icon: List },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const;

export function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid h-[var(--nav-height)] grid-cols-6 items-center px-1">
        {left.map((tab) => (
          <NavItem key={tab.href} href={tab.href} label={tab.label} active={isTabActive(pathname, tab.href)} />
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            aria-label="Quick add"
            onClick={() => openQuickAdd()}
            className="-mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-accent text-accent"
          >
            <CirclePlus size={22} strokeWidth={1.6} />
          </button>
        </li>
        {right.map((tab) => (
          <NavItem key={tab.href} href={tab.href} label={tab.label} active={isTabActive(pathname, tab.href)} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-1 text-[0.62rem] uppercase tracking-[0.12em]",
          active ? "text-ink" : "text-ink-muted",
        )}
      >
        <span className={cn("h-px w-5", active ? "bg-accent" : "bg-transparent")} />
        {label}
      </Link>
    </li>
  );
}
