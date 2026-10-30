"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { finishTransition } from "@/lib/transition";

/** Lets a running view transition finish once the new page is on screen. */
export default function TransitionDone() {
  const pathname = usePathname();
  useEffect(() => {
    finishTransition();
  }, [pathname]);
  return null;
}
