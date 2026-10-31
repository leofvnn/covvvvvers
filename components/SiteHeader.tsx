"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/shuffle";
import AccountLink from "./AccountLink";
import GridToggle from "./GridToggle";
import ThemeToggle from "./ThemeToggle";

// Big links at the top of the menu.
const MAIN = [
  { href: "/covers", label: "Covers" },
  { href: "/types", label: "Types" },
  { href: "/timeline", label: "Through the Years" },
  { href: "/games", label: "Games" },
];

const MORE = [{ href: "/colors", label: "Colours" }];

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
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // On desktop the menu floats, so a click outside it closes it.
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="header-bar">
        <Link href="/" className="wordmark">
          Covvvvvers
        </Link>
        <div className="header-actions" ref={wrap}>
          <button type="button" className="shuffle" onClick={() => shuffle(router)} title="Random cover (R)" aria-label="Random cover">
            <ShuffleIcon />
            <span className="shuffle-label">Shuffle</span>
          </button>
          <button type="button" className="menu-button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
            <span className="burger" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="menu-label">{open ? "Close" : "Menu"}</span>
          </button>
          <nav id="menu" className="menu-sheet" aria-label="Main" hidden={!open}>
            <div className="menu-main">
              {MAIN.map((l) => (
                <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                  {l.label}
                </Link>
              ))}
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
            <div className="menu-theme">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            <div className="menu-theme sub">
              <span>Grid</span>
              <GridToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
