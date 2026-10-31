"use client";

import { useEffect, useRef } from "react";
import CoverLink from "./CoverLink";

export type RingCover = { slug: string; title: string; artist: string; image: string; color: string };

const ROWS = 2;
// The two rings turn in opposite directions.
const ROW_SPEED = [1, -0.8];
const BASE_Z = "translateZ(calc(var(--persp) * 0.6))";
const BASE = `${BASE_Z} rotateX(-3deg) rotateZ(-4deg) rotateY(0deg)`;

/**
 * The home hero: the headline top left, and two counter-rotating rings of covers along
 * the bottom, seen from inside. Drag or scroll to throw them, move the pointer to tilt the
 * view, hover a cover to slow them down. The glow takes the colour of the cover in front.
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
    const scene = cyl.parentElement as HTMLElement;
    const text = el.querySelector<HTMLElement>(".ring-text");
    // How far the rings are moved up or down so their highest cover stops 40px under the text.
    const GAP = 40;
    let shift = 0;
    const step = 360 / perRow;

    let rot = 0; // degrees
    let vel = reduced ? 0 : 0.06; // degrees per frame
    const base = reduced ? 0 : 0.06;
    let cruise = base;
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
      // Covers sized to fill the space between the text and the bottom of the screen.
      const textBottom = text ? text.offsetTop + text.offsetHeight : h * 0.4;
      const room = Math.max(200, h - textBottom - GAP);
      const card = Math.round(Math.min(room * (w < 700 ? 0.55 : 0.42), w < 700 ? w * 0.8 : w * 0.17));
      const radius = Math.round((perRow * card * 1.14) / (2 * Math.PI));
      el.style.setProperty("--card", `${card}px`);
      el.style.setProperty("--radius", `${radius}px`);
      // The camera stands just inside the rings, so the near covers sweep past the edges.
      el.style.setProperty("--persp", `${Math.round(radius * 0.85)}px`);
    };
    // Lines the rings up under the text once, from fixed reference covers in the top ring at
    // rest: the highest one whose middle is on screen under the text sets the gap. Measured
    // once, so the rings never move up or down while they spin.
    const probes = [-60, -45, -30, -15, 0, 15, 30, 45, 60].map((deg) => {
      const p = document.createElement("div");
      p.className = "ring-card";
      p.setAttribute("aria-hidden", "true");
      p.style.cssText = `--row:-0.5;visibility:hidden;pointer-events:none;transform:rotateY(${deg}deg) translateZ(calc(var(--radius) * -1))`;
      cyl.appendChild(p);
      return p;
    });
    const place = () => {
      if (!text) return;
      const keep = cyl.style.transform;
      cyl.style.transform = BASE;
      const box = el.getBoundingClientRect();
      const tb = text.getBoundingClientRect();
      const under = probes
        .map((p) => p.getBoundingClientRect())
        .filter((r) => {
          const mid = (r.left + r.right) / 2;
          return mid > box.left && mid < box.right && r.right > tb.left && r.left < tb.right;
        });
      if (!under.length) return;
      const top = Math.min(...under.map((r) => r.top));
      cyl.style.transform = keep;
      // Layout position, so the text's entrance animation doesn't throw it off.
      shift += el.getBoundingClientRect().top + text.offsetTop + text.offsetHeight + GAP - top;
      scene.style.translate = `0 ${Math.round(shift)}px`;
    };
    size();
    place();
    el.classList.add("is-ready");
    let lastW = el.clientWidth;
    let lastH = el.clientHeight;
    const ro = new ResizeObserver(() => {
      // Phones resize the screen as the address bar slides; only re-place on real changes.
      if (el.clientWidth === lastW && Math.abs(el.clientHeight - lastH) < 80) return;
      lastW = el.clientWidth;
      lastH = el.clientHeight;
      size();
      place();
    });
    ro.observe(el);

    const frame = () => {
      if (!dragging) vel += (cruise - vel) * 0.02;
      rot += vel;
      tiltX += (aimX - tiltX) * 0.06;
      tiltY += (aimY - tiltY) * 0.06;
      cyl.style.transform = `${BASE_Z} rotateX(${-3 + tiltY}deg) rotateZ(${-4 + tiltX * 0.25}deg) rotateY(${tiltX}deg)`;

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
        if (row === 0 && facing > best) {
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
    // Hovering a cover slows the rings so it can be clicked.
    const over = (e: PointerEvent) => {
      cruise = (e.target as HTMLElement).closest?.(".ring-link") ? base * 0.15 : base;
    };
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
    el.addEventListener("pointerover", over);
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
      el.removeEventListener("pointerover", over);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("click", click, true);
      header?.classList.remove("on-ring");
      probes.forEach((p) => p.remove());
    };
  }, [perRow]);

  return (
    <section ref={root} className="ring-hero">
      <div className="ring-scene">
        <div ref={ring} className="ring-cyl">
          {covers.slice(0, perRow * ROWS).map((c, i) => (
            <div
              key={c.slug}
              className="ring-card"
              data-color={c.color}
              style={{ "--row": Math.floor(i / perRow) - 0.5 } as React.CSSProperties}
            >
              <CoverLink href={`/covers/${c.slug}`} className="ring-link">
                <span data-art>
                  <img src={c.image} alt={`${c.title} by ${c.artist}`} width={300} height={300} draggable={false} loading="eager" />
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
