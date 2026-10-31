"use client";

import { useRouter } from "next/navigation";
import { doneProgress, markPressed, startProgress } from "./progress";

type Router = ReturnType<typeof useRouter>;

let pending: (() => void) | null = null;

/** Called by <NavTransitions> once the new page has rendered. */
export function finishTransition() {
  doneProgress();
  if (!pending) return;
  const done = pending;
  pending = null;
  requestAnimationFrame(() => done());
}

/**
 * Navigates with a view transition, so the clicked cover grows into the cover page.
 * Falls back to a plain navigation where view transitions or motion aren't available.
 */
export function navigateWithTransition(router: Router, href: string, art?: HTMLElement | null) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> };
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Show the click landed before anything else: the loading bar and a pressed state.
  const target = new URL(href, window.location.href);
  if (target.pathname !== window.location.pathname) startProgress();
  markPressed(art?.closest("a") ?? art);
  if (!doc.startViewTransition || reduce) {
    router.push(href);
    return;
  }
  if (art) {
    // Only one element per page may carry the name, so hand it to the clicked art.
    document.querySelectorAll<HTMLElement>("[data-art], .cover-art img").forEach((el) => {
      if (el !== art) el.style.viewTransitionName = "";
    });
    art.style.viewTransitionName = "cover-art";
  }
  const t = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        pending = resolve;
        router.push(href);
        // A view transition holds the old page still until the new one is ready. If that
        // takes more than a moment, let go so the loading bar shows while it arrives.
        setTimeout(() => {
          if (pending === resolve) {
            pending = null;
            resolve();
          }
        }, 350);
      }),
  );
  t.finished.finally(() => {
    if (art) art.style.viewTransitionName = "";
  });
}

/** True when the click should open normally (new tab, modifier keys). */
export function isPlainClick(e: React.MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
