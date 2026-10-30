import type { Metadata } from "next";
import Link from "next/link";
import { getCovers, getCreators } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Creators",
  description: "The photographers, painters, designers and art directors behind rap's album covers.",
};

const letterOf = (name: string) => {
  const c = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^[^a-z0-9]+/i, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

export default async function CreatorsPage() {
  const [creators, covers] = await Promise.all([getCreators(), getCovers()]);
  const firstCover = new Map<string, string>();
  for (const c of covers) for (const cr of c.creators) if (!firstCover.has(cr.id)) firstCover.set(cr.id, c.image_url);

  const groups = new Map<string, typeof creators>();
  for (const c of creators) groups.set(letterOf(c.name), [...(groups.get(letterOf(c.name)) ?? []), c]);
  const letters = [...groups.keys()].sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)));

  return (
    <>
      <header className="page-head">
        <h1>Creators</h1>
        <p>The {creators.length} photographers, painters, designers and art directors credited in the collection.</p>
      </header>
      <nav className="letters" aria-label="Jump to letter">
        {letters.map((l) => (
          <a key={l} href={`#letter-${l}`}>
            {l}
          </a>
        ))}
      </nav>
      <div className="creator-index">
        {letters.map((l) => (
          <section key={l} id={`letter-${l}`} aria-labelledby={`h-${l}`}>
            <h2 id={`h-${l}`}>{l}</h2>
            <ul>
              {groups.get(l)!.map((c) => {
                const img = firstCover.get(c.id);
                return (
                  <li key={c.id}>
                    <Link href={`/creators/${c.slug}`}>
                      {img && <img src={squareImage(img, 120)} alt="" width={44} height={44} loading="lazy" />}
                      <span>
                        <span className="creator-name">{c.name}</span>
                        <span className="creator-role">
                          {c.role}
                          {c.count > 1 && `, ${c.count} covers`}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
