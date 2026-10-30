"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navigateWithTransition } from "@/lib/transition";

/**
 * Swipe left for the next older cover and right for the newer one on touch screens.
 * The left and right arrow keys do the same on a keyboard.
 */
export default function SwipeNav({ newer, older }: { newer: string | null; older: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (newer) router.prefetch(newer);
    if (older) router.prefetch(older);

    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let tracking = false;

    const go = (href: string | null) => {
      if (!href) return;
      navigateWithTransition(router, href, document.querySelector<HTMLElement>(".cover-art img"));
    };

    const onStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Leave sideways scrolling inside embeds and form fields alone.
      tracking = e.touches.length === 1 && !target.closest("iframe, input, select, textarea");
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      t0 = Date.now();
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Date.now() - t0 > 700 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      go(dx < 0 ? older : newer);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || el?.closest("input, select, textarea, [contenteditable]")) return;
      if (e.key === "ArrowLeft") go(newer);
      if (e.key === "ArrowRight") go(older);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [newer, older, router]);

  return null;
}
