import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import local from "@/data/collection.json";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./supabase/config";
import type { Cover, CoverCard, CoverType, Creator, CreatorWithCount } from "./types";

type Raw = {
  types: Omit<CoverType, "count">[];
  creators: Creator[];
  covers: (Omit<Cover, "type" | "creators"> & { cover_type_id: string | null })[];
  cover_creators: { cover_id: string; creator_id: string }[];
};

const byTimeline = (a: Cover, b: Cover) =>
  b.release_year - a.release_year || a.title.localeCompare(b.title, "en", { sensitivity: "base" });

/** Loads the whole collection once per render. It is small enough to keep in memory. */
const loadCollection = cache(async (): Promise<Raw> => {
  if (!supabaseEnabled) return local as Raw;

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
    covers: covers.data,
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
      };
    })
    .sort(byTimeline);

  const typeCounts = new Map<string, number>();
  for (const c of covers) if (c.type) typeCounts.set(c.type.slug, (typeCounts.get(c.type.slug) ?? 0) + 1);
  const types: CoverType[] = raw.types
    .map((t) => ({ ...t, count: typeCounts.get(t.slug) ?? 0 }))
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));

  const creatorCounts = new Map<string, number>();
  for (const c of covers) for (const cr of c.creators) creatorCounts.set(cr.id, (creatorCounts.get(cr.id) ?? 0) + 1);
  const creators: CreatorWithCount[] = raw.creators
    .map((c) => ({ ...c, count: creatorCounts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  return { covers, types, creators };
});

export const toCard = (c: Cover): CoverCard => ({
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
  creatorNames: c.creators.map((x) => x.name),
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

/** The opening of a cover's essay as plain text: whole sentences, at least about 120 characters. */
export function firstSentence(html: string | null, max = 240) {
  const text = (html ?? "")
    .replace(/<\/p>[\s\S]*$/, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  const sentences = text.match(/[^.!?]+[.!?]+["')]*(\s+|$)/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if (out.length >= 120 || (out && (out + s).length > max)) break;
    out += s;
  }
  out = out.trim() || text;
  return out.length > max ? out.slice(0, max).replace(/\s\S*$/, "") + "..." : out;
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

export async function getCreators() {
  return (await assemble()).creators;
}

export async function getCreator(slug: string) {
  const { creators, covers } = await assemble();
  const creator = creators.find((c) => c.slug === slug);
  if (!creator) return null;
  return { creator, covers: covers.filter((c) => c.creators.some((x) => x.id === creator.id)) };
}
