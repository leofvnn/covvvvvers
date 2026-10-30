import type { Metadata } from "next";
import Link from "next/link";
import { getCreators } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Creators",
  description: "The photographers, painters, designers and art directors behind rap's album covers.",
};

export default async function CreatorsPage() {
  const creators = await getCreators();
  const groups = new Map<string, typeof creators>();
  for (const c of creators) {
    const first = c.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/^[^a-z0-9]+/i, "")
      .charAt(0)
      .toUpperCase();
    const key = /[A-Z]/.test(first) ? first : "#";
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  const letters = [...groups.keys()].sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)));

  return (
    <>
      <section className="intro">
        <h1>Creators</h1>
        <p>
          The {creators.length} photographers, painters, designers and art directors credited in the collection.
        </p>
      </section>
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
              {groups.get(l)!.map((c) => (
                <li key={c.id}>
                  <Link href={`/creators/${c.slug}`}>{c.name}</Link>
                  <span>
                    {c.role}
                    {c.count > 1 && `, ${c.count} covers`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
