import type { MetadataRoute } from "next";
import { getCovers, getTypes } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [covers, types] = await Promise.all([getCovers(), getTypes()]);
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/covers` },
    { url: `${SITE_URL}/types` },
    { url: `${SITE_URL}/colors` },
    { url: `${SITE_URL}/timeline` },
    { url: `${SITE_URL}/quiz` },
    ...covers.map((c) => ({ url: `${SITE_URL}/covers/${c.slug}` })),
    ...types.map((t) => ({ url: `${SITE_URL}/types/${t.slug}` })),
  ];
}
