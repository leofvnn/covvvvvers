"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shuffle } from "@/lib/shuffle";
import { markPressed } from "@/lib/progress";
import { finishTransition, navigateWithTransition } from "@/lib/transition";

const SKIP = /^\/(auth|random|api)(\/|$)/;

/**
 * Site-wide behaviour that has no visible home of its own:
 * a soft cross-fade between pages, and keyboard shortcuts.
 */
export default function NavTransitions() {
  const pathname = usePathname();
  const router = useRouter();
  const [help, setHelp] = useState(false);

  // Let a running transition finish once the new page is on screen.
  useEffect(() => {
    finishTransition();
  }, [pathname]);

  // Cross-fade every ordinary internal link. Cover links run their own grow effect.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as HTMLElement).closest("a");
      // SVG links and anything unusual navigate normally.
      if (
        !(a instanceof HTMLAnchorElement) ||
        a.hasAttribute("data-cover-link") ||
        a.target ||
        a.hasAttribute("download")
      )
        return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || SKIP.test(url.pathname))
        return;
      // Same page with new filters or an anchor: let it happen without a fade.
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      markPressed(a);
      navigateWithTransition(router, url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Keyboard shortcuts: / search, r random cover, ? this list.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (
        el?.closest("input, select, textarea, [contenteditable], dialog[open]")
      ) {
        if (e.key === "Escape") el?.blur();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>(
          'input[type="search"]',
        );
        if (search) search.focus();
        else router.push("/covers?focus=search");
      } else if (e.key === "r" || e.key === "R") {
        shuffle(router);
      } else if (e.key === "?") {
        setHelp((h) => !h);
      } else if (e.key === "Escape") {
        setHelp(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <div id="nav-progress" className="nav-progress" aria-hidden="true" />
      {help && (
        <div
          className="shortcuts"
          role="dialog"
          aria-label="Keyboard shortcuts"
        >
          <h2>Keyboard shortcuts</h2>
          <dl>
            <div>
              <dt>/</dt>
              <dd>Search covers</dd>
            </div>
            <div>
              <dt>R</dt>
              <dd>Random cover</dd>
            </div>
            <div>
              <dt>← →</dt>
              <dd>Newer and older cover, on a cover page</dd>
            </div>
            <div>
              <dt>Esc</dt>
              <dd>Close</dd>
            </div>
          </dl>
          <button
            type="button"
            className="text-button"
            onClick={() => setHelp(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
