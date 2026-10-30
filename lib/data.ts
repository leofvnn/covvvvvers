import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import local from "@/data/collection.json";
import { familyOf } from "./color";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./supabase/config";
import { plainText } from "./text";
import type { Collection, Cover, CoverCard, CoverType, Creator, CreatorWithCount } from "./types";

export { firstSentence } from "./text";

type RawCover = Omit<Cover, "type" | "creators" | "family"> & { cover_type_id: string | null };
type Raw = {
  types: Omit<CoverType, "count">[];
  creators: Creator[];
  covers: RawCover[];
  cover_creators: { cover_id: string; creator_id: string }[];
  collections: Omit<Collection, "coverIds">[];
  collection_covers: { collection_id: string; cover_id: string; position: number }[];
};

const byTimeline = (a: Cover, b: Cover) =>
  b.release_year - a.release_year || a.title.localeCompare(b.title, "en", { sensitivity: "base" });

/** Loads the whole published collection once per render. It is small enough to keep in memory. */
const loadCollection = cache(async (): Promise<Raw> => {
  if (!supabaseEnabled) {
    const l = local as unknown as Omit<Raw, "collections" | "collection_covers">;
    return { ...l, collections: [], collection_covers: [] };
  }

  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const [types, creators, covers, links, collections, collectionCovers] = await Promise.all([
    db.from("cover_types").select("*"),
    db.from("creators").select("*"),
    db.from("covers").select("*"),
    db.from("cover_creators").select("*"),
    db.from("collections").select("*"),
    db.from("collection_covers").select("*"),
  ]);
  const err = types.error || creators.error || covers.error || links.error;
  if (err) throw new Error("Could not load the collection from Supabase: " + err.message);
  return {
    types: types.data,
    creators: creators.data,
    // Drafts and covers without art stay off the public site.
    covers: (covers.data as RawCover[]).filter((c) => (c.status ?? "published") === "published" && c.image_url),
    cover_creators: links.data,
    // Collections arrive with the feature update; until then the site builds starter ones itself.
    collections: collections.error ? [] : collections.data,
    collection_covers: collectionCovers.error ? [] : collectionCovers.data,
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

  const creatorCounts = new Map<string, number>();
  for (const c of covers) for (const cr of c.creators) creatorCounts.set(cr.id, (creatorCounts.get(cr.id) ?? 0) + 1);
  const creators: CreatorWithCount[] = raw.creators
    .map((c) => ({ ...c, count: creatorCounts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const published = new Set(covers.map((c) => c.id));
  let collections: Collection[];
  if (raw.collections.length) {
    collections = raw.collections.map((col) => ({
      ...col,
      coverIds: raw.collection_covers
        .filter((cc) => cc.collection_id === col.id && published.has(cc.cover_id))
        .sort((a, b) => a.position - b.position)
        .map((cc) => cc.cover_id),
    }));
  } else {
    collections = starterCollections(covers, creatorCounts);
  }
  collections = collections.filter((c) => c.coverIds.length).sort((a, b) => a.sort_order - b.sort_order);

  return { covers, types, creators, collections };
});

/** The same starter collections features.sql creates, for previews without the database. */
function starterCollections(covers: Cover[], creatorCounts: Map<string, number>): Collection[] {
  const make = (slug: string, title: string, description: string, sort_order: number, test: (c: Cover) => boolean) => ({
    id: slug,
    slug,
    title,
    description,
    sort_order,
    coverIds: covers.filter(test).map((c) => c.id),
  });
  return [
    make(
      "around-the-world",
      "Around the world",
      "Rap covers from outside the United States, from Paris to São Paulo to Johannesburg.",
      1,
      (c) => Boolean(c.country && c.country !== "United States"),
    ),
    make(
      "the-golden-era",
      "The golden era",
      "Covers from 1986 to 1996, when rap's visual language was being invented.",
      2,
      (c) => c.release_year >= 1986 && c.release_year <= 1996,
    ),
    make(
      "repeat-collaborators",
      "Repeat collaborators",
      "Covers by photographers, painters and designers who appear more than once in the collection.",
      3,
      (c) => c.creators.some((cr) => (creatorCounts.get(cr.id) ?? 0) > 1),
    ),
    make("hand-made", "Made by hand", "Painted, drawn and collaged covers.", 4, (c) =>
      ["painting", "illustration", "collage"].includes(c.type?.slug ?? ""),
    ),
  ];
}

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

export async function getCreators() {
  return (await assemble()).creators;
}

export async function getCreator(slug: string) {
  const { creators, covers } = await assemble();
  const creator = creators.find((c) => c.slug === slug);
  if (!creator) return null;
  return { creator, covers: covers.filter((c) => c.creators.some((x) => x.id === creator.id)) };
}

export async function getCollections() {
  const { collections, covers } = await assemble();
  const byId = new Map(covers.map((c) => [c.id, c]));
  return collections.map((col) => ({ ...col, covers: col.coverIds.map((id) => byId.get(id)!).filter(Boolean) }));
}

export async function getCollection(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}
