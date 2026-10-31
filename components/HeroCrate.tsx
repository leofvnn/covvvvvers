"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CoverLink from "./CoverLink";

export type CrateCover = { slug: string; title: string; artist: string; year: number; image: string; color: string; ink: string };

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The home hero: a crate of covers on a curved 3D track. The cover at the front sets the
 * colour of the hero and the header, and its year stands huge behind the crate.
 * Drag, swipe, scroll sideways, use the arrow keys or click a cover to bring it forward.
 */
export default function HeroCrate({ covers, total, since }: { covers: CrateCover[]; total: number; since: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const drag = useRef({ x: 0, down: false, moved: false });
  const n = covers.length;
  const cur = covers[active];

  const go = useCallback((step: number) => setActive((a) => (a + step + n) % n), [n]);

  // Turn the crate by itself until someone touches it.
  useEffect(() => {
    if (paused || reduced()) return;
    const t = window.setInterval(() => go(1), 3800);
    return () => window.clearInterval(t);
  }, [paused, go]);

  // The header takes the front cover's colour while the hero is on screen.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const el = root.current;
    if (!header || !el) return;
    const paint = (on: boolean) => {
      header.style.setProperty("--page-bg", on ? cur.color : "");
      header.style.setProperty("--page-ink", on ? cur.ink : "");
      header.classList.toggle("on-hero", on);
    };
    const io = new IntersectionObserver(([e]) => paint(e.intersectionRatio > 0.15), { threshold: [0, 0.15, 0.5] });
    io.observe(el);
    return () => {
      io.disconnect();
      paint(false);
    };
  }, [cur.color, cur.ink]);

  const offset = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <section
      ref={root}
      className="crate-hero"
      style={{ "--bg": cur.color, "--ink": cur.ink } as React.CSSProperties}
      aria-roledescription="carousel"
      aria-label="Covers from the collection"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
    >
      <div className="crate-text">
        <h1>
          Every rap album cover <span>has a story.</span>
        </h1>
        <p>
          {total} covers from {since} to now, and the people, places and ideas behind each one. <Link href="/covers">Browse them all</Link>
        </p>
      </div>

      <div
        className="crate-stage"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") (go(1), setPaused(true));
          if (e.key === "ArrowLeft") (go(-1), setPaused(true));
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
          go(e.deltaX > 0 ? 1 : -1);
          setPaused(true);
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, down: true, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 48) {
            go(dx < 0 ? 1 : -1);
            d.x = e.clientX;
            d.moved = true;
            setPaused(true);
          }
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerCancel={() => (drag.current.down = false)}
      >
        <span className="crate-year" aria-hidden="true" key={cur.year}>
          {cur.year}
        </span>
        <ul className="crate-track">
          {covers.map((c, i) => {
            const d = offset(i);
            const front = d === 0;
            const art = (
              <span className="crate-art" data-art={front ? "" : undefined}>
                <img src={c.image} alt={front ? `${c.title} by ${c.artist}, album cover` : ""} width={600} height={600} draggable={false} loading={Math.abs(d) <= 3 ? "eager" : "lazy"} />
              </span>
            );
            return (
              <li
                key={c.slug}
                className={`crate-item${front ? " is-front" : ""}`}
                style={{ "--d": d, "--ad": Math.abs(d) } as React.CSSProperties}
                aria-hidden={Math.abs(d) > 3 || undefined}
              >
                <span className="crate-vinyl" aria-hidden="true" style={{ "--label": c.color } as React.CSSProperties} />
                {front ? (
                  <CoverLink href={`/covers/${c.slug}`} className="crate-link">
                    {art}
                  </CoverLink>
                ) : (
                  <button
                    type="button"
                    className="crate-link"
                    tabIndex={-1}
                    onClick={() => {
                      if (drag.current.moved) return;
                      setActive(i);
                      setPaused(true);
                    }}
                    aria-label={`Show ${c.title}`}
                  >
                    {art}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="crate-caption" aria-live="polite">
        <button type="button" className="crate-arrow" onClick={() => (go(-1), setPaused(true))} aria-label="Previous cover">
          ←
        </button>
        <CoverLink href={`/covers/${cur.slug}`} className="crate-now">
          <strong>{cur.title}</strong>
          <span>
            {cur.artist} · {cur.year}
          </span>
        </CoverLink>
        <button type="button" className="crate-arrow" onClick={() => (go(1), setPaused(true))} aria-label="Next cover">
          →
        </button>
      </div>
    </section>
  );
}
