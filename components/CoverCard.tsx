"use client";

import { useState } from "react";
import { squareImage, squareSrcSet } from "@/lib/img";
import type { CoverCard as Card } from "@/lib/types";
import CoverLink from "./CoverLink";

const SIZES = [360, 480, 600, 720];

/** One cover in a grid: the sleeve, with a record that slides out on hover, then the title. */
export default function CoverCard({ c, eager, meta }: { c: Card; eager?: boolean; meta?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <CoverLink href={`/covers/${c.slug}`} className="card">
      <span className="card-sleeve" style={{ "--label": c.color ?? "#888" } as React.CSSProperties}>
        <span className="vinyl" aria-hidden="true" />
        <span className="card-art" data-art style={{ backgroundColor: c.color ?? "#eee" }}>
          <img
            src={squareImage(c.image_url, 600)}
            srcSet={squareSrcSet(c.image_url, SIZES)}
            sizes="(min-width: 1500px) 19vw, (min-width: 1100px) 24vw, (min-width: 800px) 32vw, (min-width: 560px) 48vw, 92vw"
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            width={600}
            height={600}
            data-loaded={loaded || undefined}
            onLoad={() => setLoaded(true)}
            ref={(img) => {
              // Cached images can finish before React attaches onLoad.
              if (img?.complete && img.naturalWidth && !loaded) setLoaded(true);
            }}
          />
        </span>
      </span>
      <span className="card-title">{c.title}</span>
      <span className="card-meta">{meta ?? `${c.artist}, ${c.release_year}`}</span>
    </CoverLink>
  );
}
