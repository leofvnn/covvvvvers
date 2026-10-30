"use client";

import { useEffect, useRef, useState } from "react";
import { squareImage } from "@/lib/img";
import type { CoverCard as Card } from "@/lib/types";
import CoverLink from "./CoverLink";

type Year = { year: number; covers: Card[] };

export default function Timeline({ years }: { years: Year[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(years[0]?.year ?? 0);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const first = years[0]?.year ?? 0;
  const last = years[years.length - 1]?.year ?? 0;

  // Work out which year sits at the left edge, for the scrubber.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const cols = el.querySelectorAll<HTMLElement>("[data-year]");
      const edge = el.scrollLeft + parseFloat(getComputedStyle(el).paddingLeft) + 40;
      let y = years[0]?.year ?? 0;
      cols.forEach((c) => {
        if (c.offsetLeft <= edge) y = Number(c.dataset.year);
      });
      setCurrent(y);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [years]);

  // Turn vertical wheel movement into sideways travel on desktop.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const jump = (year: number) => {
    const el = track.current;
    const target = el?.querySelector<HTMLElement>(`[data-year="${year}"]`);
    if (!el || !target) {
      // A year with no covers: go to the nearest one after it.
      const next = years.find((y) => y.year >= year) ?? years[years.length - 1];
      if (next && next.year !== year) jump(next.year);
      return;
    }
    el.scrollTo({ left: target.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: "smooth" });
  };

  return (
    <div className="timeline">
      <div
        ref={track}
        className="timeline-track"
        tabIndex={0}
        aria-label="Covers by year"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { down: true, x: e.clientX, left: track.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          track.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
        onClickCapture={(e) => {
          // A drag shouldn't open the cover it ended on.
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        {years.map(({ year, covers }) => (
          <section key={year} className="timeline-year" data-year={year} aria-label={String(year)}>
            <h2>{year}</h2>
            <ul style={{ gridTemplateRows: `repeat(${Math.min(covers.length, 3)}, auto)` }}>
              {covers.map((c) => (
                <li key={c.id}>
                  <CoverLink href={`/covers/${c.slug}`} className="timeline-cover">
                    <span className="timeline-art" data-art style={{ backgroundColor: c.color ?? "#eee" }}>
                      <img
                        src={squareImage(c.image_url, 360)}
                        alt=""
                        width={180}
                        height={180}
                        loading="lazy"
                        draggable={false}
                      />
                    </span>
                    <span className="timeline-title">{c.title}</span>
                    <span className="timeline-artist">{c.artist}</span>
                  </CoverLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="timeline-scrub">
        <label htmlFor="year-scrub" className="timeline-current">
          {current}
        </label>
        <input
          id="year-scrub"
          type="range"
          min={first}
          max={last}
          value={current}
          onChange={(e) => {
            setCurrent(Number(e.target.value));
            jump(Number(e.target.value));
          }}
        />
        <span className="timeline-ends">
          {first} to {last}
        </span>
      </div>
    </div>
  );
}
