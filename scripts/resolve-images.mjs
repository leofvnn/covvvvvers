/**
 * Finds an image and its source for everything in scripts/image-requests.json and writes
 * lib/images.json, which the site reads. Every image is checked to load before it's kept.
 *
 *   Records (songs, albums, mixtapes, gear, labels, films, shows):
 *     1. the lead image of the record's Wikipedia article (the cover, for music)
 *     2. the front cover on the Cover Art Archive, found through MusicBrainz
 *     3. the artwork on Apple Music
 *   People:
 *     1. the Wikimedia Commons photo chosen in lib/photos.ts
 *     2. the lead photo of their Wikipedia article
 *   with the photographer and licence from the file's Commons page.
 *
 * Runs in GitHub Actions (.github/workflows/images.yml). Node 20+, no dependencies.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UA = "Covvvvvers/1.0 (https://covvvvvers.vercel.app; image credits for a rap album cover archive)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\$/g, "s")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/^the /, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const mainArtist = (a) => a.split(/ feat\. | featuring | & | and |, | x /i)[0].trim();
const loose = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};
const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function get(url, { json = true, tries = 3 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "*/*" }, signal: AbortSignal.timeout(20000) });
      if (res.status === 429 || res.status === 503) {
        await sleep(2000 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      return json ? await res.json() : res;
    } catch {
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

/** True if the URL answers with an image. */
async function loads(url) {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
      const ok = res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
      await res.body?.cancel();
      if (ok) return true;
      if (res.status !== 429 && res.status !== 503) return false;
    } catch {}
    await sleep(1500);
  }
  return false;
}

const wiki = (params) =>
  get(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`);
const wikiPage = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

const MUSIC = new Set(["song", "album", "mixtape"]);
const KIND_WORDS = { song: "song", album: "album", mixtape: "mixtape", film: "film", gear: "", label: "record label", show: "" };
const MUSIC_DESC = /album|song|single|mixtape|\bep\b|record|soundtrack|compilation/i;

// ------------------------------------------------------------------ records

/** The lead image of a named Wikipedia article (for the hand-picked overrides). */
async function fromWikipediaPage(title) {
  const data = await wiki({ action: "query", titles: title, redirects: "1", prop: "pageimages", piprop: "thumbnail|original", pithumbsize: "600", pilicense: "any" });
  const p = data?.query?.pages?.[0];
  const img = p?.thumbnail?.source ?? p?.original?.source;
  if (img && (await loads(img))) return { src: img, full: p.original?.source ?? img, source: { name: "Wikipedia", url: wikiPage(p.title) } };
  return null;
}

async function fromWikipedia(r) {
  const artist = mainArtist(r.artist);
  const queries = MUSIC.has(r.kind)
    ? [`"${r.title}" ${artist} ${KIND_WORDS[r.kind]}`, `${r.title} ${artist}`]
    : [`"${r.title}" ${KIND_WORDS[r.kind] ?? ""}`.trim(), r.title];
  for (const q of queries) {
    const data = await wiki({
      action: "query",
      generator: "search",
      gsrsearch: q,
      gsrlimit: "8",
      prop: "pageimages|description",
      piprop: "thumbnail|original",
      pithumbsize: "600",
      pilicense: "any",
    });
    const pages = (data?.query?.pages ?? []).sort((a, b) => a.index - b.index);
    for (const p of pages) {
      const img = p.thumbnail?.source ?? p.original?.source;
      if (!img) continue;
      const base = p.title.replace(/\s*\(.*\)$/, "");
      const paren = (p.title.match(/\((.*)\)$/) ?? [])[1] ?? "";
      // Music has to match the title exactly; gear, labels, films and shows a little looser.
      if (MUSIC.has(r.kind) ? norm(base) !== norm(r.title) : !loose(p.title, r.title)) continue;
      const desc = p.description ?? "";
      if (MUSIC.has(r.kind)) {
        // The article has to be this record by this artist.
        if (!MUSIC_DESC.test(desc) && !MUSIC_DESC.test(paren)) continue;
        if (!loose(desc, artist) && !loose(paren, artist) && !desc.toLowerCase().includes(norm(artist))) continue;
      }
      if (await loads(img)) return { src: img, full: p.original?.source ?? img, source: { name: "Wikipedia", url: wikiPage(p.title) } };
    }
    await sleep(150);
  }
  return null;
}

let lastMb = 0;
async function musicbrainz(url) {
  const wait = 1100 - (Date.now() - lastMb);
  if (wait > 0) await sleep(wait);
  lastMb = Date.now();
  return get(url);
}

async function fromCoverArtArchive(r) {
  if (!MUSIC.has(r.kind)) return null;
  const artist = mainArtist(r.artist);
  const phrase = (s) => `"${s.replace(/["\\]/g, " ").trim()}"`;
  const q = `releasegroup:${phrase(r.title)} AND artist:${phrase(artist)}`;
  const data = await musicbrainz(`https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(q)}&fmt=json&limit=25`);
  const want = r.kind === "song" ? "Single" : "Album";
  const groups = (data?.["release-groups"] ?? [])
    .filter((g) => norm(g.title) === norm(r.title) && (g["artist-credit"] ?? []).some((c) => loose(c.artist?.name ?? c.name, artist)))
    .sort(
      (x, y) =>
        Number(y["primary-type"] === want) - Number(x["primary-type"] === want) ||
        (Number((x["first-release-date"] ?? "").slice(0, 4)) || 9999) - (Number((y["first-release-date"] ?? "").slice(0, 4)) || 9999),
    );
  for (const g of groups.slice(0, 3)) {
    const src = `https://coverartarchive.org/release-group/${g.id}/front-500`;
    if (await loads(src)) return { src, full: `https://coverartarchive.org/release-group/${g.id}/front`, source: { name: "Cover Art Archive", url: `https://musicbrainz.org/release-group/${g.id}` } };
  }
  return null;
}

async function fromAppleMusic(r) {
  if (!MUSIC.has(r.kind)) return null;
  const artist = mainArtist(r.artist);
  const entity = r.kind === "song" ? "song" : "album";
  const data = await get(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${r.title} ${artist}`, entity, limit: "15", country: "us" })}`);
  await sleep(400);
  for (const it of data?.results ?? []) {
    const name = entity === "song" ? it.trackName : it.collectionName;
    if (norm(name) !== norm(r.title) || !loose(it.artistName, artist) || !it.artworkUrl100) continue;
    const src = it.artworkUrl100.replace(/\/\d+x\d+bb\./, "/600x600bb.");
    if (await loads(src)) return { src, full: src.replace("/600x600bb.", "/2000x2000bb."), source: { name: "Apple Music", url: (entity === "song" ? it.trackViewUrl : it.collectionViewUrl)?.split("?")[0] } };
  }
  return null;
}

// ------------------------------------------------------------------ people

async function fileInfo(file) {
  const data = await wiki({
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "600",
  });
  const info = data?.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const src = info.thumburl ?? info.url;
  if (!(await loads(src))) return null;
  return {
    src,
    page: info.descriptionurl,
    credit: strip(meta.Artist?.value) || null,
    license: strip(meta.LicenseShortName?.value) || null,
  };
}

async function person(p) {
  if (p.file) {
    const own = await fileInfo(p.file);
    if (own) return { ...own, from: "commons" };
  }
  // A freely licensed lead photo first; otherwise whatever photo the article uses, credited to it.
  for (const pilicense of ["free", "any"]) {
    const data = await wiki({ action: "query", titles: p.wiki.replace(/_/g, " "), redirects: "1", prop: "pageimages", piprop: "name", pilicense });
    const name = data?.query?.pages?.[0]?.pageimage;
    if (!name) continue;
    const lead = await fileInfo(name);
    if (lead) return { ...lead, from: pilicense === "free" ? "wikipedia" : "wikipedia-nonfree" };
  }
  // No photo on their article: a Commons photo whose file name has their full name in it.
  const name = p.name.replace(/^The /, "");
  const found = await get(
    `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ action: "query", list: "search", srnamespace: "6", srsearch: `"${name}"`, srlimit: "10", format: "json", formatversion: "2", origin: "*" })}`,
  );
  for (const hit of found?.query?.search ?? []) {
    const file = hit.title.replace(/^File:/, "");
    if (!/\.(jpe?g|png)$/i.test(file) || !norm(file).includes(norm(name))) continue;
    const photo = await fileInfo(file);
    if (photo) return { ...photo, from: "commons-search" };
  }
  return null;
}

// ------------------------------------------------------------------ run

const req = JSON.parse(readFileSync("scripts/image-requests.json", "utf8"));
let prev = {};
try {
  prev = JSON.parse(readFileSync("lib/images.json", "utf8"));
} catch {}
let overrides = { records: {} };
try {
  overrides = JSON.parse(readFileSync("scripts/image-overrides.json", "utf8"));
} catch {}
const out = { records: {}, people: {}, missing: { records: [], people: [] } };
// Images found before are kept, so a run only searches for what's new or still missing.
// ONLY=records or ONLY=people searches that half again from scratch; FRESH=1 redoes everything.
const only = process.env.ONLY;
const fresh = process.env.FRESH === "1";
const keep = (half, key) => !fresh && only !== half && prev[half]?.[key];

for (const [i, r] of req.records.entries()) {
  if (keep("records", r.key) && !overrides.records?.[r.key]) {
    out.records[r.key] = prev.records[r.key];
    continue;
  }
  const page = overrides.records?.[r.key];
  const hit = (page && (await fromWikipediaPage(page))) ?? (await fromWikipedia(r)) ?? (await fromCoverArtArchive(r)) ?? (await fromAppleMusic(r));
  // "cover": a collection cover whose art comes from here, so the site keeps crediting it.
  if (hit) out.records[r.key] = r.cover ? { ...hit, cover: true } : hit;
  else out.missing.records.push(r.key);
  console.log(`[${i + 1}/${req.records.length}] ${hit ? hit.source.name.padEnd(17) : "MISSING          "} ${r.key}`);
}

for (const [i, p] of req.people.entries()) {
  const pick = overrides.people?.[p.id];
  if (pick === null) {
    out.missing.people.push(p.id);
    console.log(`[${i + 1}/${req.people.length}] SKIPPED   ${p.name}`);
    continue;
  }
  if (typeof pick === "string") p.file = pick;
  if (keep("people", p.id) && typeof pick !== "string") {
    out.people[p.id] = prev.people[p.id];
    continue;
  }
  const hit = await person(p);
  if (hit) out.people[p.id] = hit;
  else out.missing.people.push(p.id);
  console.log(`[${i + 1}/${req.people.length}] ${hit ? hit.from.padEnd(9) : "MISSING  "} ${p.name}`);
  await sleep(100);
}

writeFileSync("lib/images.json", JSON.stringify(out, null, 1) + "\n");
console.log(
  `\n${Object.keys(out.records).length}/${req.records.length} records, ${Object.keys(out.people).length}/${req.people.length} people.`,
  `Missing: ${out.missing.records.length} records, ${out.missing.people.length} people.`,
);
