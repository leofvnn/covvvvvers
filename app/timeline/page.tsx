import type { Metadata } from "next";
import History, { type CoverMini, type EraView, type SourceGroup } from "@/components/History";
import { CHAPTERS } from "@/lib/chapters";
import { getCovers } from "@/lib/data";
import { recordImage } from "@/lib/images";
import { MOMENTS, SOURCES, type HistoryRecord } from "@/lib/history";
import { inkFor } from "@/lib/img";
import { PEOPLE } from "@/lib/people";
import { SPOTIFY } from "@/lib/spotify";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Through the Years",
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
    if (r.kind !== "song" && r.kind !== "album" && r.kind !== "mixtape") return { ...r, cover, listen: [] as [string, string][], art: recordImage(r.title, r.artist) };
    // Exact links where we have them, otherwise a search for that exact song or album.
    const q = encodeURIComponent(`${r.title} ${r.artist.split(/ feat\. | & | and /)[0]}`);
    const id = SPOTIFY[`${r.title}|${r.artist}`];
    const listen: [string, string][] = [
      ["Spotify", id ? `https://open.spotify.com/${id}` : (cover?.spotify ?? `https://open.spotify.com/search/${q}`)],
      ["Apple Music", cover?.apple ?? `https://music.apple.com/us/search?term=${q}`],
      ["YouTube", cover?.youtube ?? `https://www.youtube.com/results?search_query=${q}`],
    ];
    // Our own copy of the cover if it's in the collection, otherwise the image found for it.
    return { ...r, cover, listen, art: cover ? null : recordImage(r.title, r.artist) };
  };

  // A moment's year: the first year it names, or the middle of the decade it names.
  const yearOf = (when: string) => {
    const decade = when.match(/(early|mid|late)-?\s*(\d{4})s/i);
    if (decade) return Number(decade[2]) + ({ early: 1, mid: 5, late: 8 } as Record<string, number>)[decade[1].toLowerCase()];
    const y = when.match(/\d{4}/);
    return y ? Number(y[0]) : 0;
  };

  const byYear = (from: number, to: number, momentIds: string[], records: (typeof CHAPTERS)[number]["records"]) => {
    const years = new Map<number, { year: number; moments: EraView["years"][number]["moments"]; records: EraView["years"][number]["records"] }>();
    const slot = (y: number) => {
      const k = Math.min(to, Math.max(from, y));
      if (!years.has(k)) years.set(k, { year: k, moments: [], records: [] });
      return years.get(k)!;
    };
    for (const id of momentIds) {
      const mo = MOMENTS[id];
      if (!mo) continue;
      // Albums live with the year's records; moments keep the songs, gear, labels and shows.
      slot(yearOf(mo.when)).moments.push({ ...mo, records: (mo.records ?? []).filter((r) => r.kind !== "album").map(withLinks) });
    }
    for (const r of records) slot(r.year).records.push(withLinks(r));
    // A song listed under the year's records isn't repeated inside the milestone.
    const listed = new Set(records.map((r) => norm(r.title)));
    for (const y of years.values()) for (const mo of y.moments) mo.records = mo.records.filter((r) => !listed.has(norm(r.title)));
    return [...years.values()].sort((x, y) => x.year - y.year);
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
      years: byYear(ch.from, ch.to, ch.moments, ch.records),
    };
  });

  // Every source behind the page: the reading for the history, each person's article, and
  // where each record's image comes from.
  const shownPeople = [...new Map(eras.flatMap((e) => e.contributors).map((p) => [p.id, p])).values()].sort((a, b) =>
    a.name.replace(/^The /, "").localeCompare(b.name.replace(/^The /, "")),
  );
  const records = [
    ...new Map(
      eras
        .flatMap((e) => e.years.flatMap((y) => [...y.records, ...y.moments.flatMap((m) => m.records)]))
        .filter((r) => !r.cover && r.art)
        .map((r) => [`${r.title}|${r.artist}`, r]),
    ).values(),
  ].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  const sources: SourceGroup[] = [
    { title: "History", note: "Dates, chart positions, sales figures and events were checked against these.", items: SOURCES },
    {
      title: "Notable figures",
      note: "Each profile draws on the person's Wikipedia article.",
      items: shownPeople.map((p) => ({ title: `${p.name}, Wikipedia`, url: `https://en.wikipedia.org/wiki/${p.wiki}` })),
    },
    {
      title: "Cover art and images",
      note: "Where the image on each song, album and release card comes from. Covers in the collection are our own copies.",
      items: records.map((r) => ({ title: `${r.title}, ${r.artist} (${r.year}): ${r.art!.source.name}`, url: r.art!.source.url })),
    },
  ];

  return <History eras={eras} sources={sources} />;
}
