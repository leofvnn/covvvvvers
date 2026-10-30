import type { Metadata } from "next";
import CoverWall from "@/components/CoverWall";
import { getCovers, getTypes, toCard } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Covers",
  description: "Every rap album cover in the collection, newest first.",
};

export default async function CoversPage() {
  const [covers, types] = await Promise.all([getCovers(), getTypes()]);
  return (
    <>
      <section className="intro">
        <h1>Covers</h1>
        <p>Every cover in the collection, newest first. Open one for its story and credits.</p>
      </section>
      <CoverWall
        covers={covers.map(toCard)}
        filters
        variant="grid"
        types={types.map((t) => ({ slug: t.slug, title: t.title }))}
      />
    </>
  );
}
