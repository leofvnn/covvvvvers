"use client";

import { useEffect, useRef } from "react";
import CoverLink from "./CoverLink";

export type RingCover = { slug: string; title: string; artist: string; image: string; color: string };

const ROWS = 3;
// Each row turns at its own speed, and the middle one turns the other way.
const ROW_SPEED = [1, -0.75, 1.2];

/**
 * The home hero: three rings of covers spinning around the headline inside a tilted
 * cylinder. Drag or scroll to throw it, move the pointer to tilt it. Covers facing away
 * fade into the dark, and the glow behind the text takes the colour of the cover in front.
 */
export default function HeroRing({ covers, title, sub }: { covers: RingCover[]; title: React.ReactNode; sub: string }) {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const perRow = Math.floor(covers.length / ROWS);

  useEffect(() => {
    const el = root.current;
    const cyl = ring.current;
    if (!el || !cyl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...cyl.querySelectorAll<HTMLElement>(".ring-card")];
    const step = 360 / perRow;

    let rot = 0; // degrees
    let vel = reduced ? 0 : 0.06; // degrees per frame
    const cruise = reduced ? 0 : 0.06;
    let tiltX = 0;
    let tiltY = 0;
    let aimX = 0;
    let aimY = 0;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let glow = "";
    let raf = 0;

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const card = Math.round(w < 700 ? h * 0.3 : Math.min(h * 0.24, w * 0.17));
      const radius = Math.round((perRow * card * 1.14) / (2 * Math.PI));
      el.style.setProperty("--card", `${card}px`);
      el.style.setProperty("--radius", `${radius}px`);
      // The camera stands just inside the ring, so the far wall sits behind the headline
      // and the near covers sweep past the edges of the screen.
      el.style.setProperty("--persp", `${Math.round(radius * 0.85)}px`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const frame = () => {
      if (!dragging) vel += (cruise - vel) * 0.02;
      rot += vel;
      tiltX += (aimX - tiltX) * 0.06;
      tiltY += (aimY - tiltY) * 0.06;
      cyl.style.transform = `translateZ(calc(var(--persp) * 0.6)) rotateX(${4 + tiltY}deg) rotateZ(${-6 + tiltX * 0.25}deg) rotateY(${tiltX}deg)`;

      let best = -2;
      let front = "";
      cards.forEach((c, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const a = col * step + (row % 2) * (step / 2) + rot * ROW_SPEED[row];
        c.style.transform = `rotateY(${a}deg) translateZ(calc(var(--radius) * -1))`;
        const facing = Math.cos((a * Math.PI) / 180);
        // Covers behind the camera are hidden; the rest stay lit.
        c.style.setProperty("--f", Math.max(0, facing + 0.15).toFixed(3));
        c.style.visibility = facing < -0.2 ? "hidden" : "";
        if (row === 1 && facing > best) {
          best = facing;
          front = c.dataset.color ?? "";
        }
      });
      if (front && front !== glow) {
        glow = front;
        el.style.setProperty("--glow", front);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      aimX = ((e.clientX - r.left) / r.width - 0.5) * 16;
      aimY = ((e.clientY - r.top) / r.height - 0.5) * -10;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      vel = dx * 0.12;
    };
    const up = () => (dragging = false);
    const wheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      vel = Math.max(-4, Math.min(4, vel + d * 0.004));
    };
    // A drag shouldn't open the cover it ends on.
    const click = (e: MouseEvent) => {
      if (moved > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: true });
    el.addEventListener("click", click, true);

    // The header sits on the dark hero while it's here.
    const header = document.querySelector<HTMLElement>(".site-header");
    header?.classList.add("on-ring");

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("click", click, true);
      header?.classList.remove("on-ring");
    };
  }, [perRow]);

  return (
    <section ref={root} className="ring-hero">
      <div className="ring-scene" aria-hidden="false">
        <div ref={ring} className="ring-cyl">
          {covers.slice(0, perRow * ROWS).map((c, i) => (
            <div
              key={c.slug}
              className="ring-card"
              data-color={c.color}
              style={{ "--row": Math.floor(i / perRow) - 1 } as React.CSSProperties}
            >
              <CoverLink href={`/covers/${c.slug}`} className="ring-link">
                <span data-art>
                  <img src={c.image} alt={`${c.title} by ${c.artist}`} width={300} height={300} draggable={false} loading={i < perRow * ROWS ? "eager" : "lazy"} />
                </span>
              </CoverLink>
            </div>
          ))}
        </div>
      </div>
      <div className="ring-text">
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </section>
  );
}
