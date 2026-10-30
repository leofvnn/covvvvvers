"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccountLink from "./AccountLink";

const LINKS = [
  { href: "/covers", label: "Covers" },
  { href: "/types", label: "Cover types" },
  { href: "/creators", label: "Creators" },
  { href: "/submit", label: "Submit a cover" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="header-bar">
        <Link href="/" className="wordmark">
          Covvvvvers
        </Link>
        <nav className="nav-inline" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
          <AccountLink />
        </nav>
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <nav id="menu" className="menu-sheet" aria-label="Main" hidden={!open}>
        <Link href="/">Home</Link>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={current(l.href)}>
            {l.label}
          </Link>
        ))}
        <AccountLink />
      </nav>
    </header>
  );
}
