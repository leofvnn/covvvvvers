"use client";

import type { useRouter } from "next/navigation";
import { startProgress } from "./progress";
import { navigateWithTransition } from "./transition";

/** Opens a random cover, never the one already on screen. */
export async function shuffle(router: ReturnType<typeof useRouter>) {
  startProgress();
  const current = window.location.pathname.match(/^\/covers\/([^/]+)/)?.[1] ?? "";
  try {
    const res = await fetch(`/random?format=json&not=${encodeURIComponent(current)}`, { cache: "no-store" });
    const { href } = (await res.json()) as { href: string };
    navigateWithTransition(router, href);
  } catch {
    window.location.assign("/random");
  }
}
