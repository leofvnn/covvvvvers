"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/shuffle";
import AccountLink from "./AccountLink";

type TypeLink = { slug: string; title: string; count: number };

const MORE = [
  { href: "/explore", label: "Explore" },
  { href: "/colors", label: "Colours" },
  { href: "/timeline", label: "Timeline" },
  { href: "/map", label: "Map" },
  { href: "/quiz", label: "Quiz" },
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

export default function SiteHeader({ types }: { types: TypeLink[] }) {
  const [open, setOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const typesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setTypesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open && !typesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setTypesOpen(false);
      }
    };
    // Close the types list when clicking anywhere else.
    const onDown = (e: PointerEvent) => {
      if (typesOpen && !typesRef.current?.contains(e.target as Node)) setTypesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, typesOpen]);

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
          <div className="types-menu" ref={typesRef}>
            <button
              type="button"
              className="types-toggle"
              aria-expanded={typesOpen}
              aria-controls="types-panel"
              aria-current={current("/types")}
              onClick={() => setTypesOpen(!typesOpen)}
            >
              Types
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {typesOpen && (
              <div id="types-panel" className="types-panel">
                <ul>
                  {types.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/types/${t.slug}`} aria-current={current(`/types/${t.slug}`)}>
                        <span>{t.title}</span>
                        <span className="types-count">{t.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/types" className="types-all">
                  All cover types
                </Link>
              </div>
            )}
          </div>
          <Link href="/explore" aria-current={current("/explore")}>
            Explore
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
          <Link href="/types" aria-current={pathname === "/types" ? "page" : undefined}>
            Types
          </Link>
        </div>
        <ul className="menu-types">
          {types.map((t) => (
            <li key={t.slug}>
              <Link href={`/types/${t.slug}`} aria-current={current(`/types/${t.slug}`)}>
                {t.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="menu-more">
          {MORE.map((l) => (
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
