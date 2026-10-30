"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { squareImage, squareSrcSet } from "@/lib/img";
import type { CoverCard } from "@/lib/types";

type Props = {
  covers: CoverCard[];
  /** Show the type, decade, country and search controls. */
  filters?: boolean;
  types?: { slug: string; title: string }[];
  /** Mark each new release year with a year tile. */
  years?: boolean;
  emptyText?: string;
  /** "wall" packs sleeves edge to edge; "grid" spaces them out with the title underneath. */
  variant?: "wall" | "grid";
};

const SIZES = [240, 360, 480, 720];

function readParams() {
  if (typeof window === "undefined") return { type: "", decade: "", country: "", q: "" };
  const p = new URLSearchParams(window.location.search);
  return { type: p.get("type") ?? "", decade: p.get("decade") ?? "", country: p.get("country") ?? "", q: p.get("q") ?? "" };
}

export default function CoverWall({
  covers,
  filters = false,
  types = [],
  years = true,
  emptyText,
  variant = "wall",
}: Props) {
  const [f, setF] = useState({ type: "", decade: "", country: "", q: "" });

  useEffect(() => {
    if (filters) setF(readParams());
  }, [filters]);

  useEffect(() => {
    if (!filters) return;
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f, filters]);

  const decades = useMemo(() => [...new Set(covers.map((c) => c.decade))].sort(), [covers]);
  const countries = useMemo(
    () =>
      [...new Set(covers.map((c) => c.country).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
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

  const active = Object.values(f).some(Boolean);

  return (
    <>
      {filters && (
        <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
          <label>
            <span>Search</span>
            <input
              type="search"
              value={f.q}
              placeholder="Album, artist or cover artist"
              onChange={(e) => setF({ ...f, q: e.target.value })}
            />
          </label>
          <label>
            <span>Cover type</span>
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Decade</span>
            <select value={f.decade} onChange={(e) => setF({ ...f, decade: e.target.value })}>
              <option value="">All decades</option>
              {decades.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Country</span>
            <select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <p className="filters-count" aria-live="polite">
            {shown.length} {shown.length === 1 ? "cover" : "covers"}
            {active && (
              <button type="button" onClick={() => setF({ type: "", decade: "", country: "", q: "" })}>
                Clear filters
              </button>
            )}
          </p>
        </form>
      )}

      {shown.length === 0 ? (
        <p className="empty">{emptyText ?? "No covers match these filters. Clear one to see more."}</p>
      ) : variant === "grid" ? (
        <ul className="cover-grid">
          {shown.map((c, i) => (
            <li key={c.id}>
              <Link href={`/covers/${c.slug}`} className="grid-card">
                <span className="grid-art" style={{ backgroundColor: c.color ?? "#ddd" }}>
                  <img
                    src={squareImage(c.image_url, 600)}
                    srcSet={squareSrcSet(c.image_url, SIZES)}
                    sizes="(min-width: 1500px) 20vw, (min-width: 1100px) 25vw, (min-width: 800px) 33vw, (min-width: 560px) 50vw, 100vw"
                    alt=""
                    loading={i < 8 ? "eager" : "lazy"}
                    decoding="async"
                    width={600}
                    height={600}
                  />
                </span>
                <span className="grid-title">{c.title}</span>
                <span className="grid-meta">
                  {[c.artist, c.type?.title, c.release_year].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="wall">
          {shown.map((c, i) => (
            <Fragment key={c.id}>
              {years && (i === 0 || shown[i - 1].release_year !== c.release_year) && (
                <li className="year-tile" aria-hidden="true">
                  <span>{c.release_year}</span>
                </li>
              )}
              <li className="sleeve" style={{ backgroundColor: c.color ?? "#ddd" }}>
                <Link href={`/covers/${c.slug}`}>
                  <img
                    src={squareImage(c.image_url, 480)}
                    srcSet={squareSrcSet(c.image_url, SIZES)}
                    sizes="(min-width: 1400px) 15vw, (min-width: 900px) 20vw, (min-width: 600px) 33vw, 50vw"
                    alt={`${c.title} by ${c.artist}, album cover`}
                    loading={i < 12 ? "eager" : "lazy"}
                    decoding="async"
                    width={480}
                    height={480}
                  />
                  <span className="sleeve-label">
                    <strong>{c.title}</strong>
                    <span>
                      {c.artist}, {c.release_year}
                    </span>
                  </span>
                </Link>
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </>
  );
}
