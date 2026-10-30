import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoverWall from "@/components/CoverWall";
import { getType, getTypes, toCard } from "@/lib/data";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getTypes()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getType((await params).slug);
  if (!found) return {};
  return { title: found.type.title, description: found.type.description ?? undefined };
}

export default async function TypePage({ params }: Params) {
  const found = await getType((await params).slug);
  if (!found) notFound();
  const { type, covers } = found;
  return (
    <>
      <section className="intro">
        <h1>{type.title}</h1>
        {type.description && <p>{type.description}</p>}
        <p className="intro-meta">
          {covers.length} {covers.length === 1 ? "cover" : "covers"}
        </p>
      </section>
      <CoverWall covers={covers.map(toCard)} emptyText="No covers of this type yet." />
    </>
  );
}
