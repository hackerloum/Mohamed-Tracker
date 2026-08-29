import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";

const groups = [
  {
    title: "Day",
    links: [
      { href: "/more/habits", label: "Habits" },
      { href: "/more/goals", label: "Goals" },
      { href: "/study", label: "Study" },
      { href: "/workout", label: "Workout" },
    ],
  },
  {
    title: "System",
    links: [
      { href: "/more/notifications", label: "Notifications" },
      { href: "/search", label: "Search" },
      { href: "/more/settings", label: "Settings" },
    ],
  },
];

export function MoreScreen() {
  return (
    <Screen>
      <AppHeader title="More" />
      <div className="flex flex-col gap-10 pt-2">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="mb-2 text-[13px] text-ink-muted">{group.title}</p>
            <ul>
              {group.links.map((link) => (
                <li key={link.href} className="border-t border-hairline">
                  <Link
                    href={link.href}
                    className="flex min-h-12 items-center justify-between text-[17px] text-ink active:opacity-70"
                  >
                    {link.label}
                    <span className="text-ink-muted">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  );
}
