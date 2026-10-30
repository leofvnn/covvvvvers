"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { isPlainClick, navigateWithTransition } from "@/lib/transition";

/** A link to a cover page whose artwork grows into the cover page when clicked. */
export default function CoverLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      data-cover-link
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        navigateWithTransition(router, href, ref.current?.querySelector<HTMLElement>("[data-art]"));
      }}
    >
      {children}
    </Link>
  );
}
