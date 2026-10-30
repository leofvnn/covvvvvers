import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import local from "@/data/collection.json";
import { familyOf } from "./color";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./supabase/config";
import { plainText } from "./text";
import type { Cover, CoverCard, CoverType, Creator } from "./types";

export { firstSentence } from "./text";

type RawCover = Omit<Cover, "type" | "creators" | "family"> & { cover_type_id: string | null };
type Raw = {
  types: Omit<CoverType, "count">[];
  creators: Creator[];
  covers: RawCover[];
  cover_creators: { cover_id: string; creator_id: string }[];
};

const byTimeline = (a: Cover, b: Cover) =>
  b.release_year - a.release_year || a.title.localeCompare(b.title, "en", { sensitivity: "base" });

/** Loads the whole published collection once per render. It is small enough to keep in memory. */
const loadCollection = cache(async (): Promise<Raw> => {
  if (!supabaseEnabled) {
    return local as unknown as Raw;
  }

  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const [types, creators, covers, links] = await Promise.all([
    db.from("cover_types").select("*"),
    db.from("creators").select("*"),
    db.from("covers").select("*"),
    db.from("cover_creators").select("*"),
  ]);
  const err = types.error || creators.error || covers.error || links.error;
  if (err) throw new Error("Could not load the collection from Supabase: " + err.message);
  return {
    types: types.data,
    creators: creators.data,
    // Drafts and covers without art stay off the public site.
    covers: (covers.data as RawCover[]).filter((c) => (c.status ?? "published") === "published" && c.image_url),
    cover_creators: links.data,
  } as Raw;
});

const assemble = cache(async () => {
  const raw = await loadCollection();
  const typeById = new Map(raw.types.map((t) => [t.id, t]));
  const creatorById = new Map(raw.creators.map((c) => [c.id, c]));
  const creatorsByCover = new Map<string, Creator[]>();
  for (const l of raw.cover_creators) {
    const c = creatorById.get(l.creator_id);
    if (!c) continue;
    const list = creatorsByCover.get(l.cover_id) ?? [];
    list.push(c);
    creatorsByCover.set(l.cover_id, list);
  }
  const covers: Cover[] = raw.covers
    .map(({ cover_type_id, ...c }) => {
      const t = cover_type_id ? typeById.get(cover_type_id) : undefined;
      return {
        ...c,
        subgenres: c.subgenres ?? [],
        type: t ? { slug: t.slug, title: t.title } : null,
        creators: creatorsByCover.get(c.id) ?? [],
        family: familyOf(c.color),
      };
    })
    .sort(byTimeline);

  const typeCounts = new Map<string, number>();
  for (const c of covers) if (c.type) typeCounts.set(c.type.slug, (typeCounts.get(c.type.slug) ?? 0) + 1);
  const types: CoverType[] = raw.types
    .map((t) => ({ ...t, count: typeCounts.get(t.slug) ?? 0 }))
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));

  return { covers, types };
});

export const toCard = (c: Cover, opts: { withText?: boolean } = {}): CoverCard => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  artist: c.artist,
  release_year: c.release_year,
  decade: c.decade,
  country: c.country,
  image_url: c.image_url,
  color: c.color,
  type: c.type,
  family: c.family,
  creatorNames: c.creators.map((x) => x.name),
  added: c.created_at,
  ...(opts.withText ? { text: plainText(c.description_html).toLowerCase() } : {}),
});

export async function getCovers() {
  return (await assemble()).covers;
}

export async function getCover(slug: string) {
  const { covers } = await assemble();
  const i = covers.findIndex((c) => c.slug === slug);
  if (i < 0) return null;
  return { cover: covers[i], newer: covers[i - 1] ?? null, older: covers[i + 1] ?? null };
}

/** Up to eight covers that share a creator, then a cover type, then a year with this one. */
export async function getRelated(cover: Cover, limit = 8) {
  const { covers } = await assemble();
  const ids = new Set(cover.creators.map((c) => c.id));
  const others = covers.filter((c) => c.id !== cover.id);
  const picked: Cover[] = [];
  const take = (list: Cover[]) => {
    for (const c of list) if (picked.length < limit && !picked.includes(c)) picked.push(c);
  };
  take(others.filter((c) => c.creators.some((cr) => ids.has(cr.id))));
  // Same type: the nearest years first, so the picks feel related.
  take(
    others
      .filter((c) => cover.type && c.type?.slug === cover.type.slug)
      .sort((a, b) => Math.abs(a.release_year - cover.release_year) - Math.abs(b.release_year - cover.release_year)),
  );
  take(others.filter((c) => c.release_year === cover.release_year));
  return picked;
}

/** The cover of the week: a different high-resolution cover every Monday, the same for everyone that week. */
export async function getFeatured() {
  const covers = await getCovers();
  const flagged = covers.filter((c) => c.featured);
  const pool = flagged.length
    ? flagged
    : covers.filter((c) => (c.image_width ?? 0) >= 1200 && c.description_html && c.creators.length);
  const list = pool.length ? pool : covers;
  const week = Math.floor((Date.now() / 86400000 + 3) / 7);
  return list[(week * 37) % list.length];
}

export async function getTypes() {
  return (await assemble()).types;
}

export async function getType(slug: string) {
  const { types, covers } = await assemble();
  const type = types.find((t) => t.slug === slug);
  if (!type) return null;
  return { type, covers: covers.filter((c) => c.type?.slug === slug) };
}


/** Every cover type that has covers, with its newest covers for the preview stack. */
export async function getTypesWithCovers(preview = 4) {
  const { types, covers } = await assemble();
  return types
    .filter((t) => t.count > 0)
    .map((t) => ({ ...t, covers: covers.filter((c) => c.type?.slug === t.slug).slice(0, preview) }));
}
