"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, MoreHorizontal, Plus, SunMedium, Wallet } from "lucide-react";
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg/92 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid h-[var(--nav-height)] grid-cols-6 items-end px-1 pb-1.5">
        {left.map((tab) => (
          <NavItem
            key={tab.href}
            href={tab.href}
            label={tab.label}
            icon={tab.icon}
            active={isTabActive(pathname, tab.href)}
          />
        ))}
        <li className="flex justify-center self-center">
          <button
            type="button"
            aria-label="Add"
            onClick={() => openQuickAdd()}
            className="-mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:scale-95"
          >
            <Plus size={22} strokeWidth={2.2} />
          </button>
        </li>
        {right.map((tab) => (
          <NavItem
            key={tab.href}
            href={tab.href}
            label={tab.label}
            icon={tab.icon}
            active={isTabActive(pathname, tab.href)}
          />
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
          "flex flex-col items-center gap-1 py-1",
          active ? "text-ink" : "text-ink-muted",
        )}
      >
        <Icon size={20} strokeWidth={active ? 2 : 1.6} />
        <span className="text-[10px] tracking-[0.04em]">{label}</span>
      </Link>
    </li>
  );
}
