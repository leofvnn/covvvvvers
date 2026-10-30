import CoverWall from "@/components/CoverWall";
import { getCovers, getTypes, toCard } from "@/lib/data";

export const revalidate = 3600;

export default async function Home() {
  const [covers, types] = await Promise.all([getCovers(), getTypes()]);
  const first = covers[covers.length - 1]?.release_year;
  const countries = new Set(covers.map((c) => c.country).filter(Boolean)).size;

  return (
    <>
      <section className="intro">
        <h1>
          {covers.length} rap album covers, {first} to now
        </h1>
        <p>
          The photographs, paintings and designs that gave rap records their faces, from {countries} countries. Each
          one comes with the story of how it was made and who made it.
        </p>
      </section>
      <CoverWall covers={covers.map(toCard)} filters types={types.map((t) => ({ slug: t.slug, title: t.title }))} />
    </>
  );
}
