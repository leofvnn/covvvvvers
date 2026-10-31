"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { squareImage } from "@/lib/img";
import type { Guide, KeyRecord } from "@/lib/chapters";
import { TAGS, type HistoryRecord, type Moment, type Tag } from "@/lib/history";
import type { Person } from "@/lib/people";
import { PHOTOS, commonsImage } from "@/lib/photos";
import CoverLink from "./CoverLink";
import PersonModal from "./PersonModal";

export type CoverMini = {
  slug: string;
  title: string;
  artist: string;
  year: number;
  image: string;
  spotify?: string | null;
  apple?: string | null;
  youtube?: string | null;
};
type RecordView = HistoryRecord & { cover: CoverMini | null; listen: [string, string][]; art?: string | null };
type MomentView = Omit<Moment, "records"> & { records: RecordView[] };
export type EraView = {
  id: string;
  label: string;
  span: string;
  from: number;
  to: number;
  title: string;
  intro: string;
  guide: Guide;
  bg: string;
  ink: string;
  posterCover: CoverMini | null;
  covers: number;
  contributors: (Person & { id: string })[];
  years: { year: number; moments: MomentView[]; records: (KeyRecord & { cover: CoverMini | null; listen: [string, string][]; art?: string | null })[] }[];
};

const GUIDE: [keyof Guide, string][] = [
  ["sound", "What it sounded like"],
  ["look", "What it looked like"],
  ["where", "Where and why it grew"],
  ["tech", "The technology"],
  ["impact", "What it changed"],
  ["legacy", "What it left behind"],
];

const KIND: Record<HistoryRecord["kind"], string> = {
  album: "Album",
  song: "Song",
  mixtape: "Mixtape",
  film: "Film",
  gear: "Gear",
  label: "Label",
  show: "TV and web",
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

function Listen({ links }: { links: [string, string][] }) {
  if (!links.length) return null;
  return (
    <p className="h-listen">
      <span>Listen</span>
      {links.map(([name, url], i) => (
        <span key={name}>
          {i > 0 && ", "}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </span>
      ))}
    </p>
  );
}

function RecordChip({ r }: { r: RecordView }) {
  const kind = KIND[r.kind];
  if (r.cover) {
    return (
      <li className="h-record has-cover">
        <CoverLink href={`/covers/${r.cover.slug}`} className="h-record-link">
          <span className="h-record-art" data-art>
            <img src={squareImage(r.cover.image, 160)} alt="" width={80} height={80} loading="lazy" />
          </span>
          <span className="h-record-text">
            <strong>{r.title}</strong>
            <span>
              {kind} · {r.artist} · {r.year}
            </span>
          </span>
        </CoverLink>
        <Listen links={r.listen} />
      </li>
    );
  }
  return (
    <li className="h-record">
      <span className="h-record-main">
        {r.art ? (
        <ArtImage src={r.art} alt="" className="h-record-art" fallback={<span className={`h-record-icon ${r.kind}`} aria-hidden="true" />} />
      ) : (
        <span className={`h-record-icon ${r.kind}`} aria-hidden="true" />
      )}
        <span className="h-record-text">
          <strong>{r.title}</strong>
          <span>
            {kind} · {r.artist} · {r.year}
          </span>
        </span>
      </span>
      <Listen links={r.listen} />
    </li>
  );
}

function Blank({ r }: { r: HistoryRecord }) {
  return (
    <span className={`h-key-art is-blank kind-${r.kind}`} aria-hidden="true">
      <span>{r.title}</span>
    </span>
  );
}

/** Outside artwork, swapped for the placeholder if it fails to load. */
function ArtImage({ src, alt, className, fallback }: { src: string; alt: string; className: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <span className={className}>
      <img src={src} alt={alt} width={200} height={200} loading="lazy" onError={() => setFailed(true)} />
    </span>
  );
}

function KeyCard({ r }: { r: KeyRecord & { cover: CoverMini | null; listen: [string, string][]; art?: string | null } }) {
  const kind = KIND[r.kind];
  const art = r.cover ? (
    <span className="h-key-art" data-art>
      <img src={squareImage(r.cover.image, 400)} alt={`${r.title} by ${r.artist}, cover`} width={200} height={200} loading="lazy" />
    </span>
  ) : r.art ? (
    <ArtImage src={r.art} alt={`${r.title} by ${r.artist}, cover`} className="h-key-art" fallback={<Blank r={r} />} />
  ) : (
    <Blank r={r} />
  );
  return (
    <li className="h-key">
      {r.cover ? (
        <CoverLink href={`/covers/${r.cover.slug}`} className="h-key-link">
          {art}
        </CoverLink>
      ) : (
        art
      )}
      <div className="h-key-body">
        <p className="h-key-meta">
          {r.year} · {kind}
        </p>
        <h4>{r.cover ? <CoverLink href={`/covers/${r.cover.slug}`}>{r.title}</CoverLink> : r.title}</h4>
        <p className="h-key-artist">{r.artist}</p>
        <p className="h-key-note">{r.note}</p>
        <Listen links={r.listen} />
      </div>
    </li>
  );
}

export default function History({ eras, sources }: { eras: EraView[]; sources: { title: string; url: string }[] }) {
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [active, setActive] = useState<string | undefined>(eras[0]?.id);
  const [year, setYear] = useState(NOW);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [person, setPerson] = useState<{ era: string; index: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const total = useMemo(() => eras.reduce((n, e) => n + e.years.reduce((k, y) => k + y.moments.length, 0), 0), [eras]);
  const records = useMemo(() => eras.reduce((n, e) => n + e.years.reduce((k, y) => k + y.records.length, 0), 0), [eras]);
  const people = useMemo(() => new Set(eras.flatMap((e) => e.contributors.map((p) => p.id))).size, [eras]);
  const shown = (m: MomentView) => filter === "all" || m.tags.includes(filter);
  const count = useMemo(() => eras.reduce((n, e) => n + e.years.reduce((k, y) => k + y.moments.filter(shown).length, 0), 0), [eras, filter]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const items = el.querySelectorAll<HTMLElement>(".h-year:not(.is-in), .h-era-band:not(.is-in)");
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
    const pool = eras.flatMap((e) => e.years.flatMap((y) => y.moments.filter(shown).map((m) => m.id)));
    if (!pool.length) return;
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && pick === flash) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
    const el = document.getElementById(pick);
    if (!el) return;
    el.closest(".h-year")?.classList.add("is-in");
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
          How a back-to-school party in a Bronx rec room grew into the biggest music in the world, year by year: {total} milestones,
          {records} key records and {people} people who made it happen.
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
                  <span>Contributions</span>
                  <ul>
                    {era.contributors.map((p, index) => (
                      <li key={p.id}>
                        <button type="button" onClick={() => setPerson({ era: era.id, index })} aria-haspopup="dialog">
                          <span className="h-avatar" aria-hidden="true">
                            {PHOTOS[p.id] ? (
                              <img src={commonsImage(PHOTOS[p.id].file, 96)} alt="" width={28} height={28} loading="lazy" />
                            ) : (
                              p.name.replace(/^The /, "")[0]
                            )}
                          </span>
                          {p.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <details className="h-guide-wrap">
                <summary>
                  About this era <span>How it sounded and looked, where and why it grew, and what it left behind</span>
                </summary>
                <div className="h-guide">
                  {GUIDE.map(([k, label]) => (
                    <section key={k} className={`h-guide-item g-${k}`}>
                      <h3>{label}</h3>
                      <p>{era.guide[k]}</p>
                    </section>
                  ))}
                </div>
              </details>

              <ol className="h-years">
                {era.years.map((y) => {
                  const ms = y.moments.filter(shown);
                  const recs = filter === "all" ? y.records : [];
                  if (!ms.length && !recs.length) return null;
                  return (
                    <li key={y.year} id={`year-${y.year}`} className="h-year">
                      <div className="h-year-label">
                        <span className="h-dot" aria-hidden="true" />
                        <span>{y.year}</span>
                      </div>
                      <div className="h-year-body">
                        {ms.map((m) => (
                          <article key={m.id} id={m.id} className={`h-entry${flash === m.id ? " is-flash" : ""}`}>
                            <div className="h-card">
                              <div className="h-tags">
                                {m.when !== String(y.year) && <span className="h-when-note">{m.when}</span>}
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
                                    <RecordChip key={r.title + r.artist + r.kind} r={r} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          </article>
                        ))}
                        {recs.length > 0 && (
                          <div className="h-year-records">
                            <p className="h-year-rel">Released in {y.year}</p>
                            <ul className="h-key-grid">
                              {recs.map((r) => (
                                <KeyCard key={r.title + r.artist} r={r} />
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
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

      {person && (() => {
        const era = eras.find((e) => e.id === person.era)!;
        const list = era.contributors;
        return (
          <PersonModal
            person={list[person.index]}
            era={era}
            position={`${person.index + 1} of ${list.length}`}
            onPrev={() => setPerson({ era: era.id, index: (person.index - 1 + list.length) % list.length })}
            onNext={() => setPerson({ era: era.id, index: (person.index + 1) % list.length })}
            onClose={() => setPerson(null)}
          />
        );
      })()}

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
