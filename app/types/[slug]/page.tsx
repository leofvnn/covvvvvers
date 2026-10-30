import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CoverGrid from "@/components/CoverGrid";
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
      <header className="page-head">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Covers", href: "/covers" },
            { label: "Types", href: "/types" },
            { label: type.title },
          ]}
        />
        <h1>{type.title}</h1>
        {type.description && <p>{type.description}</p>}
        <p className="page-count">
          {covers.length} {covers.length === 1 ? "cover" : "covers"}
        </p>
      </header>
      <CoverGrid covers={covers.map((c) => toCard(c))} emptyText="No covers of this type yet." showType={false} />
    </>
  );
}
