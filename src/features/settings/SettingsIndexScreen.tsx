import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Hairline } from "@/components/ui/Hairline";
import { Screen } from "@/components/ui/Screen";
import { ChevronRight } from "lucide-react";

const pages = [
  { href: "/more/settings/appearance", label: "Appearance" },
  { href: "/more/settings/prayer", label: "Prayer" },
  { href: "/more/settings/score", label: "Score weights" },
  { href: "/more/settings/notifications", label: "Notifications" },
  { href: "/more/settings/categories", label: "Categories" },
  { href: "/more/settings/payment-methods", label: "Payment methods" },
  { href: "/more/settings/data", label: "Data" },
  { href: "/more/settings/account", label: "Account" },
];

export function SettingsIndexScreen() {
  return (
    <Screen>
      <AppHeader title="Settings" />
      <ul>
        {pages.map((page) => (
          <li key={page.href}>
            <Link href={page.href} className="flex items-center justify-between py-3.5 text-[1.02rem] text-ink">
              {page.label}
              <ChevronRight size={16} className="text-ink-muted" />
            </Link>
            <Hairline />
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-ink-muted">
        <Link href="/more/debug/notifications">Notification debug</Link>
      </p>
    </Screen>
  );
}
