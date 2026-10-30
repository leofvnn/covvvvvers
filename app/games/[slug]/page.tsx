import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Game from "@/components/Game";
import { GAMES, gameBySlug } from "@/lib/games";
import { gamePool } from "@/lib/gamepool";

export const revalidate = 3600;
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const g = gameBySlug((await params).slug);
  return g ? { title: g.title, description: g.blurb } : {};
}

export default async function GamePage({ params }: Params) {
  const g = gameBySlug((await params).slug);
  if (!g) notFound();
  const { pool, minYear, maxYear } = await gamePool();
  return (
    <>
      <header className="page-head">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: g.title }]} />
        <h1>{g.title}</h1>
        <p>{g.blurb}</p>
      </header>
      <Game game={g.slug} pool={pool} minYear={minYear} maxYear={maxYear} />
    </>
  );
}
