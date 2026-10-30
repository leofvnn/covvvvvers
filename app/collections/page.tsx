import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Collections",
  description: "Hand-picked sets of rap album covers.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <>
      <header className="page-head">
        <h1>Collections</h1>
        <p>Hand-picked sets from the archive, like small exhibitions.</p>
      </header>
      <ul className="collection-list">
        {collections.map((col) => (
          <li key={col.id}>
            <Link href={`/collections/${col.slug}`} className="collection-card">
              <span className="collection-stack" aria-hidden="true">
                {col.covers.slice(0, 4).map((c, i) => (
                  <img
                    key={c.id}
                    src={squareImage(c.image_url, 360)}
                    alt=""
                    width={180}
                    height={180}
                    loading="lazy"
                    style={{ "--i": i } as React.CSSProperties}
                  />
                ))}
              </span>
              <span className="collection-text">
                <span className="collection-title">{col.title}</span>
                {col.description && <span className="collection-desc">{col.description}</span>}
                <span className="collection-count">{col.covers.length} covers</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
