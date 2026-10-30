import Link from "next/link";
import CoverGrid from "@/components/CoverGrid";
import CoverLink from "@/components/CoverLink";
import { firstSentence, getCovers, getFeatured, getTypes, toCard } from "@/lib/data";
import { fullImage, inkFor } from "@/lib/img";

export const revalidate = 3600;

export default async function Home() {
  const [featured, covers, types] = await Promise.all([getFeatured(), getCovers(), getTypes()]);
  const bg = featured.color ?? "#111111";
  const ink = inkFor(bg);
  const recent = covers.filter((c) => c.id !== featured.id).slice(0, 12);

  const doors = [
    { href: "/covers", label: "Covers", note: `All ${covers.length}, newest first` },
    { href: "/types", label: "Cover types", note: `${types.filter((t) => t.count).length} ways a cover gets made` },
    { href: "/colors", label: "Colours", note: "Browse by the colour of the sleeve" },
    { href: "/timeline", label: "Timeline", note: "The story of hip-hop, 1973 to now" },
  ];

  return (
    <>
      <section className="feature" style={{ "--bg": bg, "--ink": ink } as React.CSSProperties}>
        <CoverLink href={`/covers/${featured.slug}`} className="feature-link">
          <span className="feature-art" data-art>
            <img
              src={fullImage(featured.image_url, 1400)}
              alt={`${featured.title} by ${featured.artist}, album cover`}
              width={1400}
              height={1400}
              fetchPriority="high"
            />
          </span>
          <span className="feature-text">
            <span className="feature-label">Cover of the week</span>
            <span className="feature-title">{featured.title}</span>
            <span className="feature-artist">
              {featured.artist}, {featured.release_year}
            </span>
            <span className="feature-story">{firstSentence(featured.description_html)}</span>
            <span className="feature-more">Read the story</span>
          </span>
        </CoverLink>
      </section>

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
