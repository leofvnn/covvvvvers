import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoverGrid from "@/components/CoverGrid";
import { getCollection, getCollections, toCard } from "@/lib/data";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const col = await getCollection((await params).slug);
  if (!col) return {};
  return { title: col.title, description: col.description ?? undefined };
}

export default async function CollectionPage({ params }: Params) {
  const col = await getCollection((await params).slug);
  if (!col) notFound();
  return (
    <>
      <header className="page-head">
        <p className="crumb">
          <Link href="/collections">Collections</Link>
        </p>
        <h1>{col.title}</h1>
        {col.description && <p>{col.description}</p>}
        <p className="page-count">{col.covers.length} covers</p>
      </header>
      <CoverGrid covers={col.covers.map((c) => toCard(c))} />
    </>
  );
}
