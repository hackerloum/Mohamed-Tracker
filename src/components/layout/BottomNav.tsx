"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, MoreHorizontal, Plus, Sun, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui";

const tabs = [
  { href: "/today", label: "Today", icon: Sun },
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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-bg/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-3 mb-2 h-px bg-hairline" />
      <ul className="grid h-[var(--nav-height)] grid-cols-6 items-center px-1">
        {tabs.slice(0, 2).map((tab) => (
          <NavItem key={tab.href} {...tab} active={isTabActive(pathname, tab.href)} />
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            aria-label="Add"
            onClick={() => openQuickAdd()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg active:opacity-70"
          >
            <Plus size={18} strokeWidth={2.25} />
          </button>
        </li>
        {tabs.slice(2).map((tab) => (
          <NavItem key={tab.href} {...tab} active={isTabActive(pathname, tab.href)} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (typeof tabs)[number]["icon"];
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-0.5 py-1",
          active ? "text-ink" : "text-ink-muted/80",
        )}
      >
        <Icon size={19} strokeWidth={active ? 1.9 : 1.5} />
        <span className="text-[10px]">{label}</span>
      </Link>
    </li>
  );
}
