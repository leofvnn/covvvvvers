import type { Metadata } from "next";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { gamePool } from "@/lib/gamepool";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Games",
  description: "Games about rap album covers: guess the year, fill in the blank, name the cover and more.",
};

export default async function GamesPage() {
  const { covers } = await gamePool();
  const pick = (i: number) => covers[(i * 37 + 11) % covers.length];
  return (
    <>
      <header className="page-head">
        <h1>Games</h1>
        <p>Ten rounds each, built from the covers in the collection. A new set every time you play.</p>
      </header>
      <ul className="games-grid">
        {GAMES.map((g, i) => {
          const c = pick(i);
          return (
            <li key={g.slug}>
              <Link href={`/games/${g.slug}`} className="game-card">
                <span className="game-art" style={{ backgroundColor: c.color ?? "#eee" }}>
                  <img src={squareImage(c.image_url, 600)} alt="" width={300} height={300} loading="lazy" />
                </span>
                <span className="game-title">{g.title}</span>
                <span className="game-blurb">{g.blurb}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
