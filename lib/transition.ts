"use client";

import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

let pending: (() => void) | null = null;

/** Called by <TransitionDone> once the new page has rendered. */
export function finishTransition() {
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
  if (!doc.startViewTransition || reduce) {
    router.push(href);
    return;
  }
  if (art) art.style.viewTransitionName = "cover-art";
  const t = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        pending = resolve;
        router.push(href);
        // Never leave the page frozen if the new route is slow.
        setTimeout(finishTransition, 1200);
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
