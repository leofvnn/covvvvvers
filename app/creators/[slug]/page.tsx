import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoverGrid from "@/components/CoverGrid";
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
      <header className="page-head">
        <p className="crumb">
          <Link href="/creators">Creators</Link>
        </p>
        <h1>{creator.name}</h1>
        <p className="page-count">
          {creator.role ?? "Creator"}, {covers.length} {covers.length === 1 ? "cover" : "covers"}
        </p>
      </header>
      <CoverGrid covers={covers.map((c) => toCard(c))} />
    </>
  );
}
