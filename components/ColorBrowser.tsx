"use client";

import { useEffect, useMemo, useState } from "react";
import type { Family } from "@/lib/color";
import type { CoverCard as Card } from "@/lib/types";
import CoverGrid from "./CoverGrid";

export default function ColorBrowser({
  covers,
  families,
  counts,
}: {
  covers: Card[];
  families: Family[];
  counts: Record<string, number>;
}) {
  const available = families.filter((f) => counts[f.slug] > 0);
  const [active, setActive] = useState(available[0]?.slug ?? "");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && counts[c]) setActive(c);
  }, [counts]);

  const pick = (slug: string) => {
    setActive(slug);
    window.history.replaceState(window.history.state, "", `?c=${slug}`);
  };

  const shown = useMemo(() => covers.filter((c) => c.family === active), [covers, active]);
  const fam = families.find((f) => f.slug === active);

  return (
    <>
      <div className="swatches" role="radiogroup" aria-label="Colour">
        {available.map((f) => (
          <button
            key={f.slug}
            type="button"
            role="radio"
            aria-checked={active === f.slug}
            className="swatch"
            onClick={() => pick(f.slug)}
          >
            <span className="swatch-chip" style={{ backgroundColor: f.swatch }} />
            <span className="swatch-name">{f.name}</span>
            <span className="swatch-count">{counts[f.slug]}</span>
          </button>
        ))}
      </div>
      <p className="swatch-summary" aria-live="polite">
        {shown.length} {fam?.name.toLowerCase()} {shown.length === 1 ? "cover" : "covers"}
      </p>
      <CoverGrid key={active} covers={shown} />
    </>
  );
}
