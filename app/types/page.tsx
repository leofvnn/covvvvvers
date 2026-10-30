import type { Metadata } from "next";
import Link from "next/link";
import { getTypesWithCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Cover types",
  description: "Rap album covers grouped by how they were made: photographs, paintings, collages, typography and more.",
};

export default async function TypesPage() {
  const types = await getTypesWithCovers();
  return (
    <>
      <header className="page-head">
        <h1>Cover types</h1>
        <p>The collection grouped by how each cover was made.</p>
      </header>
      <ul className="collection-list">
        {types.map((t) => (
          <li key={t.slug}>
            <Link href={`/types/${t.slug}`} className="collection-card">
              <span className="collection-stack" aria-hidden="true">
                {t.covers.map((c, i) => (
                  <img
                    key={c.id}
                    src={squareImage(c.image_url, 360)}
                    alt=""
                    width={180}
                    height={180}
                    loading="lazy"
                    style={{ "--i": i, backgroundColor: c.color ?? undefined } as React.CSSProperties}
                  />
                ))}
              </span>
              <span className="collection-text">
                <span className="collection-title">{t.title}</span>
                {t.description && <span className="collection-desc">{t.description}</span>}
                <span className="collection-count">
                  {t.count} {t.count === 1 ? "cover" : "covers"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
