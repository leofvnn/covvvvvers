import type { Metadata } from "next";
import Timeline from "@/components/Timeline";
import { getCovers, toCard } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Timeline",
  description: "Rap album covers year by year, from the 1980s to now.",
};

export default async function TimelinePage() {
  const covers = await getCovers();
  // Oldest on the left, so the line reads forward in time.
  const years = new Map<number, ReturnType<typeof toCard>[]>();
  for (const c of [...covers].reverse()) {
    const list = years.get(c.release_year) ?? [];
    list.push(toCard(c));
    years.set(c.release_year, list);
  }
  return (
    <>
      <header className="page-head">
        <h1>Timeline</h1>
        <p>Drag, scroll or swipe sideways to travel from the first covers to the newest.</p>
      </header>
      <Timeline years={[...years.entries()].map(([year, list]) => ({ year, covers: list }))} />
    </>
  );
}
