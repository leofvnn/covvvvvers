import type { Metadata } from "next";
import Link from "next/link";
import { getTypes } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Cover types",
  description: "Rap album covers grouped by how they were made: photographs, paintings, collages, typography and more.",
};

export default async function TypesPage() {
  const types = (await getTypes()).filter((t) => t.count > 0);
  return (
    <>
      <section className="intro">
        <h1>Cover types</h1>
        <p>The collection grouped by how each cover was made.</p>
      </section>
      <ul className="type-list">
        {types.map((t) => (
          <li key={t.slug}>
            <Link href={`/types/${t.slug}`}>
              {t.hero_image && (
                <img src={squareImage(t.hero_image, 480)} alt="" width={240} height={240} loading="lazy" />
              )}
              <span className="type-name">{t.title}</span>
              <span className="type-count">
                {t.count} {t.count === 1 ? "cover" : "covers"}
              </span>
              {t.description && <span className="type-desc">{t.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
