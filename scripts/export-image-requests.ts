/**
 * Lists everything on the site that needs an image and isn't served from our own bucket:
 * timeline records (songs, albums, mixtapes, gear, labels, films, shows), the people, and
 * the covers added from the history list. scripts/resolve-images.mjs finds each image and
 * its source. Run with: npx tsx scripts/export-image-requests.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CHAPTERS } from "../lib/chapters";
import { ERAS } from "../lib/history";
import { PEOPLE } from "../lib/people";
import { PHOTOS } from "../lib/photos";

const records = new Map<string, { key: string; title: string; artist: string; kind: string; year: number }>();
const add = (r: { title: string; artist: string; kind: string; year: number }) => {
  const key = `${r.title}|${r.artist}`;
  if (!records.has(key)) records.set(key, { key, title: r.title, artist: r.artist, kind: r.kind, year: r.year });
};
CHAPTERS.forEach((c) => c.records.forEach(add));
ERAS.forEach((e) => e.moments.forEach((m) => (m.records ?? []).forEach(add)));

// Covers inserted without an image by supabase/new-covers.sql.
const sql = readFileSync("supabase/new-covers.sql", "utf8");
const row = /values \('((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)',(\d{4})/g;
for (const m of sql.matchAll(row)) {
  const un = (s: string) => s.replace(/''/g, "'");
  add({ title: un(m[2]), artist: un(m[3]), kind: "album", year: Number(m[4]) });
}

const people = Object.entries(PEOPLE).map(([id, p]) => ({ id, name: p.name, wiki: p.wiki, file: PHOTOS[id]?.file ?? null }));

writeFileSync("scripts/image-requests.json", JSON.stringify({ records: [...records.values()], people }, null, 1) + "\n");
console.log(records.size, "records,", people.length, "people");
