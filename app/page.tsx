import Link from "next/link";
import CoverGrid from "@/components/CoverGrid";
import HeroCrate, { type CrateCover } from "@/components/HeroCrate";
import { getCovers, getFeatured, getTypes, toCard } from "@/lib/data";
import { inkFor, squareImage } from "@/lib/img";

export const revalidate = 3600;

export default async function Home() {
  const [featured, covers, types] = await Promise.all([getFeatured(), getCovers(), getTypes()]);
  // The crate: the cover of the week up front, then one cover from each stretch of years,
  // so a turn of the crate walks from the early records to the newest ones.
  const withArt = covers.filter((c) => c.image_url);
  const byYear = [...withArt].sort((a, b) => a.release_year - b.release_year);
  const picks = [featured];
  const want = 20;
  for (let i = 0; i < want * 3 && picks.length < want; i++) {
    const c = byYear[Math.floor((i * byYear.length) / (want * 3))];
    if (c && !picks.some((p) => p.id === c.id || p.artist === c.artist)) picks.push(c);
  }
  const crate: CrateCover[] = picks
    .filter((c) => c.image_url)
    .map((c) => {
      const color = c.color && /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : "#111111";
      return { slug: c.slug, title: c.title, artist: c.artist, year: c.release_year, image: squareImage(c.image_url, 600), color, ink: inkFor(color) };
    });
  const recent = covers.filter((c) => c.id !== featured.id).slice(0, 12);

  const doors = [
    { href: "/covers", label: "Covers", note: `All ${covers.length}, newest first` },
    { href: "/types", label: "Cover types", note: `${types.filter((t) => t.count).length} ways a cover gets made` },
    { href: "/colors", label: "Colours", note: "Browse by the colour of the sleeve" },
    { href: "/timeline", label: "Timeline", note: "The story of hip-hop, 1973 to now" },
  ];

  return (
    <>
      <HeroCrate covers={crate} total={covers.length} since={byYear[0]?.release_year ?? 1980} />

      <section className="home-section" aria-labelledby="recent-h">
        <div className="section-head">
          <h2 id="recent-h">Recent albums</h2>
          <Link href="/covers">See all covers</Link>
        </div>
        <div className="recent">
          <CoverGrid covers={recent.map((c) => toCard(c))} eager={4} />
        </div>
      </section>

      <nav className="doors" aria-label="Browse">
        {doors.map((d) => (
          <Link key={d.href} href={d.href}>
            <span className="door-label">{d.label}</span>
            <span className="door-note">{d.note}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
