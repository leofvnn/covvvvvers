import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoverWall from "@/components/CoverWall";
import { getCreator, getCreators, toCard } from "@/lib/data";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCreators()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getCreator((await params).slug);
  if (!found) return {};
  const { creator, covers } = found;
  return {
    title: creator.name,
    description: `Rap album covers by ${creator.name}: ${covers.map((c) => c.title).join(", ")}.`,
  };
}

export default async function CreatorPage({ params }: Params) {
  const found = await getCreator((await params).slug);
  if (!found) notFound();
  const { creator, covers } = found;
  return (
    <>
      <section className="intro">
        <h1>{creator.name}</h1>
        <p>
          {creator.role ?? "Creator"}, {covers.length} {covers.length === 1 ? "cover" : "covers"} in the collection
        </p>
      </section>
      <CoverWall covers={covers.map(toCard)} />
    </>
  );
}
