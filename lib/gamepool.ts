import { getCovers } from "./data";
import type { GameItem } from "./games";

/** Covers for the games: high-resolution ones make fairer questions. */
export async function gamePool() {
  const covers = await getCovers();
  const pool: GameItem[] = covers
    .filter((c) => (c.image_width ?? 0) >= 1000 || covers.length < 60)
    .map((c) => ({ id: c.id, slug: c.slug, title: c.title, artist: c.artist, year: c.release_year, image: c.image_url, color: c.color }));
  const years = covers.map((c) => c.release_year);
  return { pool, covers, minYear: Math.min(...years), maxYear: Math.max(...years) };
}
