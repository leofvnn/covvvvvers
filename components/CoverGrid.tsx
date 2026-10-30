"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { squareImage, squareSrcSet } from "@/lib/img";
import type { CoverCard } from "@/lib/types";
import CoverLink from "./CoverLink";

type Filters = { type: string; decade: string; country: string; q: string };
const EMPTY: Filters = { type: "", decade: "", country: "", q: "" };

type Props = {
  covers: CoverCard[];
  /** Show search and the type, decade and country filters. */
  filters?: boolean;
  types?: { slug: string; title: string }[];
  emptyText?: string;
  /** Eager-load this many images; the rest load as you scroll. */
  eager?: number;
};

const SIZES = [360, 480, 600, 720];

export default function CoverGrid({ covers, filters = false, types = [], emptyText, eager = 8 }: Props) {
  const [f, setF] = useState<Filters>(EMPTY);
  const sheet = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!filters) return;
    const p = new URLSearchParams(window.location.search);
    setF({ type: p.get("type") ?? "", decade: p.get("decade") ?? "", country: p.get("country") ?? "", q: p.get("q") ?? "" });
  }, [filters]);

  useEffect(() => {
    if (!filters) return;
    const p = new URLSearchParams();
    (Object.entries(f) as [keyof Filters, string][]).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", qs ? `?${qs}` : window.location.pathname);
  }, [f, filters]);

  const decades = useMemo(() => [...new Set(covers.map((c) => c.decade))].sort().reverse(), [covers]);
  const countries = useMemo(
    () => [...new Set(covers.map((c) => c.country).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [covers],
  );

  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return covers.filter(
      (c) =>
        (!f.type || c.type?.slug === f.type) &&
        (!f.decade || c.decade === f.decade) &&
        (!f.country || c.country === f.country) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.artist.toLowerCase().includes(q) ||
          c.creatorNames.some((n) => n.toLowerCase().includes(q))),
    );
  }, [covers, f]);

  const activeCount = [f.type, f.decade, f.country].filter(Boolean).length;
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const selects = (
    <>
      <label className="field">
        <span>Cover type</span>
        <select value={f.type} onChange={set("type")}>
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Decade</span>
        <select value={f.decade} onChange={set("decade")}>
          <option value="">All decades</option>
          {decades.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Country</span>
        <select value={f.country} onChange={set("country")}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
    </>
  );

  return (
    <>
      {filters && (
        <div className="filter-bar">
          <form className="filter-row" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="field search">
              <span className="visually-hidden">Search covers</span>
              <input type="search" value={f.q} placeholder="Search covers" onChange={set("q")} />
            </label>
            <div className="filter-selects">{selects}</div>
            <button type="button" className="filter-open" onClick={() => sheet.current?.showModal()}>
              Filter{activeCount > 0 && ` (${activeCount})`}
            </button>
            <p className="filter-count" aria-live="polite">
              {shown.length} {shown.length === 1 ? "cover" : "covers"}
              {(activeCount > 0 || f.q) && (
                <button type="button" className="text-button" onClick={() => setF(EMPTY)}>
                  Clear
                </button>
              )}
            </p>
          </form>

          <dialog
            ref={sheet}
            className="sheet"
            aria-labelledby="sheet-title"
            onClick={(e) => e.target === sheet.current && sheet.current?.close()}
          >
            <div className="sheet-inner">
              <div className="sheet-head">
                <h2 id="sheet-title">Filter</h2>
                {activeCount > 0 && (
                  <button type="button" className="text-button" onClick={() => setF({ ...EMPTY, q: f.q })}>
                    Clear filters
                  </button>
                )}
              </div>
              {selects}
              <button type="button" className="button solid wide" onClick={() => sheet.current?.close()}>
                Show {shown.length} {shown.length === 1 ? "cover" : "covers"}
              </button>
            </div>
          </dialog>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="empty">{emptyText ?? "No covers match. Clear a filter to see more."}</p>
      ) : (
        <ul className="cover-grid">
          {shown.map((c, i) => (
            <li key={c.id}>
              <CoverLink href={`/covers/${c.slug}`} className="card">
                <span className="card-art" data-art style={{ backgroundColor: c.color ?? "#eee" }}>
                  <img
                    src={squareImage(c.image_url, 600)}
                    srcSet={squareSrcSet(c.image_url, SIZES)}
                    sizes="(min-width: 1500px) 19vw, (min-width: 1100px) 24vw, (min-width: 800px) 32vw, (min-width: 560px) 48vw, 92vw"
                    alt=""
                    loading={i < eager ? "eager" : "lazy"}
                    decoding="async"
                    width={600}
                    height={600}
                  />
                </span>
                <span className="card-title">{c.title}</span>
                <span className="card-meta">
                  {c.artist}, {c.release_year}
                </span>
              </CoverLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
