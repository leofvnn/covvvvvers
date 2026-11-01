"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The account's sections, as tabs that are each their own page. */
export default function AccountTabs({ counts }: { counts: { lists: number; submissions: number } }) {
  const path = usePathname();
  const tabs = [
    { href: "/me/lists", label: "Lists", count: counts.lists, also: "/me/saved" },
    { href: "/me/submissions", label: "Submissions", count: counts.submissions },
    { href: "/me/settings", label: "Settings" },
  ];
  return (
    <nav className="account-tabs" aria-label="Account">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} aria-current={path === t.href || ("also" in t && path === t.also) ? "page" : undefined}>
          {t.label}
          {t.count !== undefined && <span>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
