/**
 * Album art for timeline records that aren't in the collection yet, from
 * MusicBrainz and the Cover Art Archive.
 *
 * Records are matched to MusicBrainz release groups on the server, several per
 * search request, respecting MusicBrainz's limit of one request a second, and the
 * results are cached for a week. The image is the Cover Art Archive's front cover
 * for that release group; if it has none, the page falls back to the placeholder.
 */

const WEEK = 60 * 60 * 24 * 7;
const UA = "Covvvvvers/1.0 ( https://covvvvvers.com )";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\$/g, "s")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** The first credited artist: "Dr. Dre feat. Snoop" becomes "Dr. Dre". */
const mainArtist = (artist: string) => artist.split(/ feat\. | & | and |, /i)[0].trim();

const loose = (a: string, b: string) => {
  const x = norm(a);
  const y = norm(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};

/** Quotes a phrase for MusicBrainz's Lucene search. */
const phrase = (s: string) => `"${s.replace(/["\\]/g, " ").trim()}"`;

type Item = { key: string; title: string; artist: string; kind: string };
type ReleaseGroup = {
  id: string;
  title: string;
  "primary-type"?: string;
  "first-release-date"?: string;
  "artist-credit"?: { name?: string; artist?: { name?: string } }[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(items: Item[]): Promise<ReleaseGroup[]> {
  const query = items.map((i) => `(releasegroup:${phrase(i.title)} AND artist:${phrase(mainArtist(i.artist))})`).join(" OR ");
  const url = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=100`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: WEEK },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.["release-groups"] ?? [];
  } catch {
    return [];
  }
}

/** Picks the release group that best matches one record. */
function pick(item: Item, groups: ReleaseGroup[]) {
  const artist = mainArtist(item.artist);
  const want = item.kind === "song" ? "Single" : "Album";
  const matches = groups.filter(
    (g) => loose(g.title, item.title) && (g["artist-credit"] ?? []).some((c) => loose(c.artist?.name ?? c.name ?? "", artist)),
  );
  const exact = (g: ReleaseGroup) => norm(g.title) === norm(item.title);
  const year = (g: ReleaseGroup) => Number((g["first-release-date"] ?? "").slice(0, 4)) || 9999;
  matches.sort(
    (x, y) =>
      Number(exact(y)) - Number(exact(x)) ||
      Number(y["primary-type"] === want) - Number(x["primary-type"] === want) ||
      year(x) - year(y),
  );
  return matches[0];
}

/** Front cover URL for each record, keyed by item.key. */
export async function artworkFor(items: Item[], batchSize = 8) {
  const out = new Map<string, string>();
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const groups = await search(batch);
    for (const item of batch) {
      const g = pick(item, groups);
      if (g) out.set(item.key, `https://coverartarchive.org/release-group/${g.id}/front-500`);
    }
    // MusicBrainz allows one request per second per client.
    if (i + batchSize < items.length) await sleep(1100);
  }
  return out;
}
