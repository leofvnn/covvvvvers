"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { CoverCard as Card } from "@/lib/types";
import CoverCard, { cardMeta } from "./CoverCard";

type Sort = "newest" | "added" | "oldest" | "az" | "saved";
type Filters = { type: string; decade: string; country: string; q: string; sort: Sort };
const EMPTY: Filters = { type: "", decade: "", country: "", q: "", sort: "newest" };

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest releases" },
  { value: "added", label: "Latest added" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "A to Z" },
  { value: "saved", label: "Most saved" },
];

type Props = {
  covers: Card[];
  /** Show search, sorting and the type, decade and country filters. */
  filters?: boolean;
  types?: { slug: string; title: string }[];
  emptyText?: string;
  /** Eager-load this many images; the rest load as you scroll. */
  eager?: number;
  /** Show each cover's type under its title. Pages for a single type turn it off. */
  showType?: boolean;
};

export default function CoverGrid({ covers, filters = false, types = [], emptyText, eager = 8, showType = true }: Props) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [saves, setSaves] = useState<Map<string, number> | null>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!filters) return;
    const p = new URLSearchParams(window.location.search);
    const sort = p.get("sort") as Sort | null;
    setF({
      type: p.get("type") ?? "",
      decade: p.get("decade") ?? "",
      country: p.get("country") ?? "",
      q: p.get("q") ?? "",
      sort: sort && SORTS.some((s) => s.value === sort) ? sort : "newest",
    });
    if (p.get("focus") === "search") search.current?.focus();
  }, [filters]);

  useEffect(() => {
    if (!filters) return;
    const p = new URLSearchParams();
    (Object.entries(f) as [keyof Filters, string][]).forEach(([k, v]) => v && !(k === "sort" && v === "newest") && p.set(k, v));
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", qs ? `?${qs}` : window.location.pathname);
  }, [f, filters]);

  // Save counts load only when someone sorts by them.
  useEffect(() => {
    if (f.sort !== "saved" || saves) return;
    const db = getBrowserClient();
    if (!db) {
      setSaves(new Map());
      return;
    }
    db.rpc("cover_save_counts").then(({ data }) => {
      setSaves(new Map(((data ?? []) as { cover_id: string; saves: number }[]).map((r) => [r.cover_id, r.saves])));
    });
  }, [f.sort, saves]);

  const decades = useMemo(() => [...new Set(covers.map((c) => c.decade))].sort().reverse(), [covers]);
  const countries = useMemo(
    () => [...new Set(covers.map((c) => c.country).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [covers],
  );

  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const list = covers.filter(
      (c) =>
        (!f.type || c.type?.slug === f.type) &&
        (!f.decade || c.decade === f.decade) &&
        (!f.country || c.country === f.country) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.artist.toLowerCase().includes(q) ||
          c.creatorNames.some((n) => n.toLowerCase().includes(q)) ||
          (c.text?.includes(q) ?? false)),
    );
    if (f.sort === "oldest") return [...list].reverse();
    // Covers added together keep release order among themselves.
    if (f.sort === "added")
      return list
        .map((c, i) => ({ c, i }))
        .sort((a, b) => (b.c.added ?? "").localeCompare(a.c.added ?? "") || a.i - b.i)
        .map((x) => x.c);
    if (f.sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
    if (f.sort === "saved" && saves) return [...list].sort((a, b) => (saves.get(b.id) ?? 0) - (saves.get(a.id) ?? 0));
    return list;
  }, [covers, f, saves]);

  // When the match is inside the essay, say so under the title.
  const essayHit = (c: Card) => {
    const q = f.q.trim().toLowerCase();
    if (!q || !c.text) return undefined;
    const inTitle =
      c.title.toLowerCase().includes(q) ||
      c.artist.toLowerCase().includes(q) ||
      c.creatorNames.some((n) => n.toLowerCase().includes(q));
    return inTitle ? undefined : `${cardMeta(c, showType)}. Mentioned in the story`;
  };

  const activeCount = [f.type, f.decade, f.country].filter(Boolean).length;
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const selects = (
    <>
      <label className="field">
        <span>Sort</span>
        <select value={f.sort} onChange={set("sort")}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
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
              <span className="visually-hidden">Search covers and their stories</span>
              <input
                ref={search}
                type="search"
                value={f.q}
                placeholder="Search covers and stories"
                onChange={set("q")}
              />
            </label>
            <div className="filter-selects">{selects}</div>
            <button type="button" className="filter-open" onClick={() => sheet.current?.showModal()}>
              Filter{activeCount > 0 && ` (${activeCount})`}
            </button>
            <p className="filter-count" aria-live="polite">
              {shown.length} {shown.length === 1 ? "cover" : "covers"}
              {(activeCount > 0 || f.q) && (
                <button type="button" className="text-button" onClick={() => setF({ ...EMPTY, sort: f.sort })}>
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
                <h2 id="sheet-title">Filter and sort</h2>
                {activeCount > 0 && (
                  <button type="button" className="text-button" onClick={() => setF({ ...EMPTY, q: f.q, sort: f.sort })}>
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
        <p className="empty">{emptyText ?? "No covers match. Clear a filter or try another word."}</p>
      ) : (
        <ul className="cover-grid">
          {shown.map((c, i) => (
            <li key={c.id}>
              <CoverCard c={c} eager={i < eager} meta={essayHit(c)} showType={showType} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
