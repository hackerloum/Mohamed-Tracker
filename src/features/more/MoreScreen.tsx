import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Hairline } from "@/components/ui/Hairline";
import { Screen } from "@/components/ui/Screen";
import { ChevronRight } from "lucide-react";

const links = [
  { href: "/more/habits", label: "Habits" },
  { href: "/more/goals", label: "Goals" },
  { href: "/more/notifications", label: "Notifications" },
  { href: "/more/settings", label: "Settings" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/study", label: "Study" },
  { href: "/workout", label: "Workout" },
  { href: "/search", label: "Search" },
];

export function MoreScreen() {
  return (
    <Screen>
      <AppHeader title="More" />
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center justify-between py-3.5 text-[1.02rem] text-ink">
              {link.label}
              <ChevronRight size={16} className="text-ink-muted" />
            </Link>
            <Hairline />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
