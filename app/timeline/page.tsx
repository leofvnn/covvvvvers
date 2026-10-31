import type { Metadata } from "next";
import History, { type CoverMini, type EraView } from "@/components/History";
import { CHAPTERS } from "@/lib/chapters";
import { getCovers } from "@/lib/data";
import { MOMENTS, SOURCES, type HistoryRecord } from "@/lib/history";
import { inkFor } from "@/lib/img";
import { PEOPLE } from "@/lib/people";
import { SPOTIFY } from "@/lib/spotify";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The history of hip-hop from a Bronx rec room in 1973 to now: how it sounded and looked, where and why it grew, the records, technology, milestones and people that shaped each era.",
};

const pageColor = (hex: string | null) => (hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#111111");
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export default async function TimelinePage() {
  const covers = await getCovers();
  const bySlug = new Map(covers.map((c) => [c.slug, c]));
  const mini = (c: (typeof covers)[number]): CoverMini => ({
    slug: c.slug,
    title: c.title,
    artist: c.artist,
    year: c.release_year,
    image: c.image_url,
    spotify: c.spotify_url ?? (c.spotify_album_id ? `https://open.spotify.com/album/${c.spotify_album_id}` : null),
    apple: c.apple_music_url,
    youtube: c.youtube_url,
  });

  // Match a landmark album to a cover in the collection by title and artist.
  const byTitle = new Map<string, typeof covers>();
  for (const c of covers) {
    const k = norm(c.title);
    byTitle.set(k, [...(byTitle.get(k) ?? []), c]);
  }
  const findCover = (title: string, artist: string) => {
    const list = byTitle.get(norm(title));
    if (!list) return null;
    const a = norm(artist);
    const hit = list.find((c) => {
      const ca = norm(c.artist);
      return a.includes(ca) || ca.includes(a);
    });
    return hit ? mini(hit) : null;
  };

  const withLinks = <R extends HistoryRecord>(r: R) => {
    const cover = r.kind === "album" || r.kind === "mixtape" ? findCover(r.title, r.artist) : null;
    if (r.kind !== "song" && r.kind !== "album" && r.kind !== "mixtape") return { ...r, cover, listen: [] as [string, string][] };
    // Exact links where we have them, otherwise a search for that exact song or album.
    const q = encodeURIComponent(`${r.title} ${r.artist.split(/ feat\. | & | and /)[0]}`);
    const id = SPOTIFY[`${r.title}|${r.artist}`];
    const listen: [string, string][] = [
      ["Spotify", id ? `https://open.spotify.com/${id}` : (cover?.spotify ?? `https://open.spotify.com/search/${q}`)],
      ["Apple Music", cover?.apple ?? `https://music.apple.com/us/search?term=${q}`],
      ["YouTube", cover?.youtube ?? `https://www.youtube.com/results?search_query=${q}`],
    ];
    return { ...r, cover, listen };
  };

  const eras: EraView[] = CHAPTERS.map((ch) => {
    const poster = bySlug.get(ch.poster);
    const bg = pageColor(poster?.color ?? null);
    return {
      id: ch.id,
      label: ch.label,
      span: ch.span,
      from: ch.from,
      to: ch.to,
      title: ch.title,
      intro: ch.intro,
      guide: ch.guide,
      bg,
      ink: inkFor(bg),
      posterCover: poster ? mini(poster) : null,
      covers: covers.filter((c) => c.release_year >= ch.from && c.release_year <= ch.to).length,
      contributors: ch.people.filter((id) => PEOPLE[id]).map((id) => ({ id, ...PEOPLE[id] })),
      keyRecords: [...ch.records].sort((x, y) => x.year - y.year).map(withLinks),
      moments: ch.moments
        .filter((id) => MOMENTS[id])
        .map((id) => {
          const mo = MOMENTS[id];
          // Albums live in Key records; moments keep the songs, gear, labels and shows.
          return { ...mo, records: (mo.records ?? []).filter((r) => r.kind !== "album").map(withLinks) };
        }),
    };
  });

  return <History eras={eras} sources={SOURCES} />;
}
