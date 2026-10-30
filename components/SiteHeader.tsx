"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shuffle } from "@/lib/shuffle";
import AccountLink from "./AccountLink";

const MORE = [
  { href: "/colors", label: "Colours" },
  { href: "/timeline", label: "Timeline" },
  { href: "/games", label: "Games" },
];

const CONTRIBUTE = [
  { href: "/submit", label: "Submit a cover" },
  { href: "/feedback", label: "Feedback" },
];

function ShuffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h3.5c2.5 0 3.7 1.2 5 3.5l1 1.8c1.3 2.3 2.5 3.7 5 3.7H21M3 17h3.5c1.5 0 2.5-.5 3.4-1.4M14.1 8.4c.9-.9 1.9-1.4 3.4-1.4H21M18 4l3 3-3 3M18 14l3 3-3 3" />
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
          <Link href="/covers" aria-current={current("/covers")}>
            Covers
          </Link>
          <Link href="/types" aria-current={current("/types")}>
            Types
          </Link>
          <button type="button" className="shuffle" onClick={() => shuffle(router)} title="Random cover (R)">
            <ShuffleIcon />
            Shuffle
          </button>
          <AccountLink />
        </nav>
        <div className="header-mobile">
          <button type="button" className="shuffle icon-only" onClick={() => shuffle(router)} aria-label="Random cover">
            <ShuffleIcon />
          </button>
          <button type="button" className="menu-button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <nav id="menu" className="menu-sheet" aria-label="Main" hidden={!open}>
        <div className="menu-main">
          <Link href="/">Home</Link>
          <Link href="/covers" aria-current={current("/covers")}>
            Covers
          </Link>
          <Link href="/types" aria-current={current("/types")}>
            Types
          </Link>
        </div>
        <div className="menu-more">
          {MORE.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="menu-more">
          {CONTRIBUTE.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
          <AccountLink />
        </div>
      </nav>
    </header>
  );
}
