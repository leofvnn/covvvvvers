import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getCovers, getCreators, getTypes } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Explore",
  description: "Every way into the collection: by colour, year, country, cover type, creator and more.",
};

export default async function ExplorePage() {
  const [covers, types, creators, collections] = await Promise.all([
    getCovers(),
    getTypes(),
    getCreators(),
    getCollections(),
  ]);
  const countries = new Set(covers.map((c) => c.country).filter(Boolean)).size;
  const first = covers[covers.length - 1]?.release_year;
  const pick = (i: number) => covers[(i * 29) % covers.length];

  const ways = [
    { href: "/collections", label: "Collections", note: `${collections.length} hand-picked sets`, cover: collections[0]?.covers[0] ?? pick(1) },
    { href: "/colors", label: "Colours", note: "Browse by the colour of the sleeve", cover: pick(2) },
    { href: "/timeline", label: "Timeline", note: `${first} to now, year by year`, cover: pick(3) },
    { href: "/map", label: "Map", note: `Covers from ${countries} countries`, cover: pick(4) },
    { href: "/types", label: "Cover types", note: `${types.filter((t) => t.count).length} ways a cover gets made`, cover: pick(5) },
    { href: "/creators", label: "Creators", note: `${creators.length} photographers, painters and designers`, cover: pick(6) },
    { href: "/quiz", label: "Quiz", note: "Name the album from a piece of its cover", cover: pick(7) },
  ];

  return (
    <>
      <header className="page-head">
        <h1>Explore</h1>
        <p>Every way into the collection.</p>
      </header>
      <ul className="explore-grid">
        {ways.map((w) => (
          <li key={w.href}>
            <Link href={w.href} className="explore-card" style={{ backgroundColor: w.cover?.color ?? "#eee" }}>
              {w.cover && <img src={squareImage(w.cover.image_url, 480)} alt="" width={240} height={240} loading="lazy" />}
              <span className="explore-text">
                <span className="explore-label">{w.label}</span>
                <span className="explore-note">{w.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
