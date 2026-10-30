import { geoEqualEarth, geoPath } from "d3-geo";
import type { Metadata } from "next";
import Link from "next/link";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { getCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Map",
  description: "Where the rap album covers in the collection come from.",
};

// Country names in the collection that differ from the map's names.
const MAP_NAME: Record<string, string> = {
  "United States": "United States of America",
};

type Geo = GeoJSON.Feature<GeoJSON.Geometry, { name: string }>;

export default async function MapPage() {
  const covers = await getCovers();
  const byCountry = new Map<string, typeof covers>();
  for (const c of covers) {
    if (!c.country) continue;
    byCountry.set(c.country, [...(byCountry.get(c.country) ?? []), c]);
  }
  const countries = [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length);
  const max = countries[0]?.[1].length ?? 1;

  const topo = world as unknown as Parameters<typeof feature>[0] & { objects: { countries: never } };
  const shapes = (feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, { name: string }>)
    .features as Geo[];
  const W = 960;
  const H = 480;
  const projection = geoEqualEarth().fitExtent(
    [
      [0, 8],
      [W, H - 8],
    ],
    { type: "FeatureCollection", features: shapes.filter((s) => s.properties.name !== "Antarctica") },
  );
  const path = geoPath(projection);
  const counted = new Map(countries.map(([name, list]) => [MAP_NAME[name] ?? name, { name, n: list.length }]));

  return (
    <>
      <header className="page-head">
        <h1>Map</h1>
        <p>
          Covers from {countries.length} countries. The darker the country, the more covers it has. Choose a country
          below to see them.
        </p>
      </header>
      <figure className="map">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`World map highlighting ${countries.map(([n]) => n).join(", ")}`}>
          {shapes
            .filter((s) => s.properties.name !== "Antarctica")
            .map((s, i) => {
              const hit = counted.get(s.properties.name);
              const d = path(s) ?? "";
              if (!hit) return <path key={i} d={d} className="map-land" />;
              // Square-root scale, so the US doesn't wash out everyone else.
              const strength = (0.35 + 0.65 * Math.sqrt(hit.n / max)).toFixed(3);
              return <path key={i} d={d} className="map-hit" fillOpacity={strength} />;
            })}
        </svg>
      </figure>
      <ul className="country-list">
        {countries.map(([name, list]) => (
          <li key={name}>
            <Link href={`/covers?country=${encodeURIComponent(name)}`}>
              <span className="country-thumbs" aria-hidden="true">
                {list.slice(0, 3).map((c) => (
                  <img key={c.id} src={squareImage(c.image_url, 96)} alt="" width={40} height={40} loading="lazy" />
                ))}
              </span>
              <span className="country-name">{name}</span>
              <span className="country-count">{list.length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
