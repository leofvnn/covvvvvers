import type { Metadata } from "next";
import ColorBrowser from "@/components/ColorBrowser";
import { FAMILIES } from "@/lib/color";
import { getCovers, toCard } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Colours",
  description: "Browse rap album covers by the colour of the sleeve.",
};

export default async function ColorsPage() {
  const covers = await getCovers();
  const counts = Object.fromEntries(FAMILIES.map((f) => [f.slug, covers.filter((c) => c.family === f.slug).length]));
  return (
    <>
      <header className="page-head">
        <h1>Colours</h1>
        <p>Pick a colour to see every cover whose sleeve is mostly that colour.</p>
      </header>
      <ColorBrowser covers={covers.map((c) => toCard(c))} families={FAMILIES} counts={counts} />
    </>
  );
}
