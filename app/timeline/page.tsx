import type { Metadata } from "next";
import History, { type CoverMini, type EraView } from "@/components/History";
import { getCovers } from "@/lib/data";
import { ERAS, SOURCES } from "@/lib/history";
import { inkFor } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Timeline",
  description: "How hip-hop grew from a Bronx rec room in 1973 into the biggest music in the world: the moments, records and artists that shaped it.",
};

const pageColor = (hex: string | null) => (hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#111111");

export default async function TimelinePage() {
  const covers = await getCovers();
  const bySlug = new Map(covers.map((c) => [c.slug, c]));
  const mini = (slug: string): CoverMini | null => {
    const c = bySlug.get(slug);
    return c ? { slug: c.slug, title: c.title, artist: c.artist, year: c.release_year, image: c.image_url } : null;
  };

  const eras: EraView[] = ERAS.map((era) => {
    const poster = bySlug.get(era.poster);
    const bg = pageColor(poster?.color ?? null);
    const inEra = covers.filter((c) => c.release_year >= era.from && c.release_year <= era.to);
    return {
      ...era,
      bg,
      ink: inkFor(bg),
      posterCover: mini(era.poster),
      covers: inEra.length,
      moments: era.moments.map((m) => ({
        ...m,
        records: (m.records ?? []).map((r) => ({ ...r, cover: r.slug ? mini(r.slug) : null })),
      })),
    };
  });

  return <History eras={eras} sources={SOURCES} />;
}
