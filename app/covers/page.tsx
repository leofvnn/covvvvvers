import type { Metadata } from "next";
import CoverGrid from "@/components/CoverGrid";
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
      <header className="page-head">
        <h1>Covers</h1>
        <p>Every cover in the collection, newest first.</p>
      </header>
      <CoverGrid
        covers={covers.map(toCard)}
        filters
        types={types.filter((t) => t.count).map((t) => ({ slug: t.slug, title: t.title }))}
      />
    </>
  );
}
