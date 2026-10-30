"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { squareImage } from "@/lib/img";
import { TAGS, type Era, type HistoryRecord, type Moment, type Tag } from "@/lib/history";
import CoverLink from "./CoverLink";

export type CoverMini = { slug: string; title: string; artist: string; year: number; image: string };
type RecordView = HistoryRecord & { cover: CoverMini | null };
type MomentView = Omit<Moment, "records"> & { records: RecordView[] };
export type EraView = Omit<Era, "moments"> & {
  bg: string;
  ink: string;
  posterCover: CoverMini | null;
  covers: number;
  moments: MomentView[];
};

const FIRST = 1973;
const NOW = 2026;
const fmt = new Intl.NumberFormat("en-GB");

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Counts a number up the first time it scrolls into view. */
function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1200);
          setN(Math.round(value * (1 - (1 - p) ** 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span ref={ref} className="h-stat-value">
      {prefix}
      {fmt.format(n)}
      {suffix}
    </span>
  );
}

function RecordChip({ r }: { r: RecordView }) {
  const kind = r.kind === "album" ? "Album" : r.kind === "song" ? "Song" : r.kind === "mixtape" ? "Mixtape" : "Film";
  if (r.cover) {
    return (
      <li>
        <CoverLink href={`/covers/${r.cover.slug}`} className="h-record has-cover">
          <span className="h-record-art" data-art>
            <img src={squareImage(r.cover.image, 160)} alt="" width={80} height={80} loading="lazy" />
          </span>
          <span className="h-record-text">
            <strong>{r.title}</strong>
            <span>
              {r.artist} · {r.year}
            </span>
          </span>
        </CoverLink>
      </li>
    );
  }
  return (
    <li>
      <span className="h-record">
        <span className={`h-record-icon ${r.kind}`} aria-hidden="true" />
        <span className="h-record-text">
          <strong>{r.title}</strong>
          <span>
            {kind} · {r.artist} · {r.year}
          </span>
        </span>
      </span>
    </li>
  );
}

export default function History({ eras, sources }: { eras: EraView[]; sources: { title: string; url: string }[] }) {
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [active, setActive] = useState<string | undefined>(eras[0]?.id);
  const [year, setYear] = useState(NOW);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const total = useMemo(() => eras.reduce((n, e) => n + e.moments.length, 0), [eras]);
  const shown = (m: MomentView) => filter === "all" || m.tags.includes(filter);
  const count = useMemo(() => eras.reduce((n, e) => n + e.moments.filter(shown).length, 0), [eras, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // The hero year ticks from 1973 up to today.
  useEffect(() => {
    if (reduced()) return;
    setYear(FIRST);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1800);
      setYear(Math.round(FIRST + (NOW - FIRST) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Which era is on screen, and how far through the story the reader is.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const sections = [...el.querySelectorAll<HTMLElement>("[data-era]")];
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = sections[0]?.dataset.era;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.dataset.era;
      setActive(current);
      const story = el.querySelector<HTMLElement>(".h-story");
      if (story) {
        const r = story.getBoundingClientRect();
        setProgress(Math.max(0, Math.min(1, (line - r.top) / r.height)));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Moments fade up as they arrive.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".h-moment:not(.is-in), .h-era-band:not(.is-in)");
    if (reduced() || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [filter]);

  // Keep the active era chip visible in the rail on phones.
  useEffect(() => {
    const chip = root.current?.querySelector<HTMLElement>(`.h-rail [data-target="${active}"]`);
    const rail = chip?.parentElement;
    if (chip && rail) rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  const surprise = () => {
    const pool = eras.flatMap((e) => e.moments.filter(shown).map((m) => m.id));
    if (!pool.length) return;
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && pick === flash) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
    const el = document.getElementById(pick);
    if (!el) return;
    el.classList.add("is-in");
    el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    setFlash(pick);
    window.setTimeout(() => setFlash((f) => (f === pick ? null : f)), 2600);
  };

  const activeEra = eras.find((e) => e.id === active) ?? eras[0];

  return (
    <div className="history" ref={root}>
      <header className="h-hero">
        <p className="h-kicker">The story of hip-hop</p>
        <h1 className="h-hero-year" aria-label={`${FIRST} to ${NOW}`}>
          <span>{FIRST}</span>
          <span className="h-hero-arrow" aria-hidden="true">
            →
          </span>
          <span className="h-hero-now">{year}</span>
        </h1>
        <p className="h-hero-lede">
          How a back-to-school party in a Bronx rec room grew into the biggest music in the world. {total} moments, the records that
          shaped each one, and the covers from the collection that came out of it.
        </p>
        <div className="h-hero-actions">
          <button type="button" className="button solid" onClick={() => go(eras[0].id)}>
            Start in the Bronx
          </button>
          <button type="button" className="button" onClick={surprise}>
            Surprise me
          </button>
        </div>
      </header>

      <nav className="h-rail-wrap" aria-label="Eras" style={{ "--era-bg": activeEra.bg, "--era-ink": activeEra.ink } as React.CSSProperties}>
        <div className="h-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="h-rail">
          {eras.map((e) => (
            <button
              key={e.id}
              type="button"
              data-target={e.id}
              aria-current={active === e.id ? "true" : undefined}
              onClick={() => go(e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="h-filters" role="group" aria-label="Show">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            Everything
          </button>
          {TAGS.map((t) => (
            <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(filter === t.id ? "all" : t.id)}>
              {t.label}
            </button>
          ))}
          <span className="h-filter-count" aria-live="polite">
            {filter === "all" ? `${total} moments` : `${count} of ${total}`}
          </span>
        </div>
      </nav>

      <div className="h-story">
        {eras.map((era, i) => {
          const visible = era.moments.filter(shown);
          return (
            <section
              key={era.id}
              id={era.id}
              data-era={era.id}
              className="h-era"
              style={{ "--era-bg": era.bg, "--era-ink": era.ink } as React.CSSProperties}
              aria-labelledby={`${era.id}-title`}
            >
              <div className="h-era-band">
                <div className="h-era-text">
                  <p className="h-era-num">
                    Chapter {i + 1} · {era.span}
                  </p>
                  <h2 id={`${era.id}-title`}>{era.title}</h2>
                  <p className="h-era-intro">{era.intro}</p>
                  <p className="h-era-sound">
                    <span>The sound</span> {era.sound}
                  </p>
                </div>
                {era.posterCover && (
                  <CoverLink href={`/covers/${era.posterCover.slug}`} className="h-era-poster">
                    <span className="h-era-poster-art" data-art>
                      <img
                        src={squareImage(era.posterCover.image, 720)}
                        alt={`${era.posterCover.title} by ${era.posterCover.artist}, album cover`}
                        width={360}
                        height={360}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </span>
                    <span className="h-era-poster-cap">
                      {era.posterCover.title} · {era.posterCover.artist}
                    </span>
                  </CoverLink>
                )}
                <div className="h-era-artists">
                  <span>Who shaped it</span>
                  <ul>
                    {era.artists.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <ol className="h-moments">
                {visible.map((m) => (
                  <li key={m.id} id={m.id} className={`h-moment${flash === m.id ? " is-flash" : ""}`}>
                    <div className="h-when">
                      <span className="h-dot" aria-hidden="true" />
                      <span>{m.when}</span>
                    </div>
                    <div className="h-card">
                      <div className="h-tags">
                        {m.tags.map((t) => (
                          <button key={t} type="button" onClick={() => setFilter(t)} aria-label={`Show only ${TAGS.find((x) => x.id === t)?.label}`}>
                            {TAGS.find((x) => x.id === t)?.label}
                          </button>
                        ))}
                      </div>
                      <h3>{m.title}</h3>
                      <p>{m.text}</p>
                      {m.stat && (
                        <p className="h-stat">
                          <CountUp value={m.stat.value} prefix={m.stat.prefix} suffix={m.stat.suffix} />
                          <span className="h-stat-label">{m.stat.label}</span>
                        </p>
                      )}
                      {m.records.length > 0 && (
                        <ul className="h-records" aria-label="Records">
                          {m.records.map((r) => (
                            <RecordChip key={r.title + r.artist} r={r} />
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
                {visible.length === 0 && <li className="h-empty">Nothing tagged this way in these years.</li>}
              </ol>
              {era.covers > 0 && (
                <p className="h-era-more">
                  {era.covers} {era.covers === 1 ? "cover" : "covers"} in the collection from {era.span.replace(" to now", " onward")}.
                </p>
              )}
            </section>
          );
        })}
      </div>

      <footer className="h-sources">
        <h2>Sources</h2>
        <p>Dates, chart positions and sales figures were checked against these.</p>
        <ul>
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
