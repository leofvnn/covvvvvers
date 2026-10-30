import type { MetadataRoute } from "next";
import { getCovers, getCreators, getTypes } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [covers, types, creators] = await Promise.all([getCovers(), getTypes(), getCreators()]);
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/types` },
    { url: `${SITE_URL}/creators` },
    ...covers.map((c) => ({ url: `${SITE_URL}/covers/${c.slug}` })),
    ...types.map((t) => ({ url: `${SITE_URL}/types/${t.slug}` })),
    ...creators.map((c) => ({ url: `${SITE_URL}/creators/${c.slug}` })),
  ];
}
