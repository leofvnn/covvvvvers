import type { Metadata } from "next";
import Link from "next/link";
import { getCovers, getTypes } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Cover types",
  description: "Rap album covers grouped by how they were made: photographs, paintings, collages, typography and more.",
};

export default async function TypesPage() {
  const [types, covers] = await Promise.all([getTypes(), getCovers()]);
  const list = types.filter((t) => t.count > 0);
  return (
    <>
      <header className="page-head">
        <h1>Cover types</h1>
        <p>The collection grouped by how each cover was made.</p>
      </header>
      <ul className="index-list">
        {list.map((t) => {
          const img = t.hero_image ?? covers.find((c) => c.type?.slug === t.slug)?.image_url;
          return (
            <li key={t.slug}>
              <Link href={`/types/${t.slug}`}>
                {img && <img src={squareImage(img, 240)} alt="" width={120} height={120} loading="lazy" />}
                <span className="index-text">
                  <span className="index-name">{t.title}</span>
                  {t.description && <span className="index-desc">{t.description}</span>}
                </span>
                <span className="index-count">{t.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
