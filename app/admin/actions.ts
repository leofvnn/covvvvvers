"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/admin";
import { decadeOf, paragraphsToHtml, slugify } from "@/lib/text";

/** Approve, reject or reopen a submission. "draft" approves it and opens a new draft cover. */
export async function reviewSubmission(form: FormData) {
  const id = String(form.get("id") ?? "");
  const choice = String(form.get("status") ?? "");
  if (!id || !["approved", "rejected", "pending", "draft"].includes(choice)) return;
  const db = await adminClient();
  const status = choice === "draft" ? "approved" : choice;
  await db
    .from("submissions")
    .update({ status, reviewed_at: status === "pending" ? null : new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/submissions");

  if (choice === "draft") {
    const { data: sub } = await db.from("submissions").select("*").eq("id", id).single();
    if (!sub) return;
    const coverId = await createDraft(db, {
      title: sub.album_title,
      artist: sub.artist,
      year: sub.release_year ?? new Date().getFullYear(),
      credits: sub.cover_credit,
      note: sub.note,
    });
    redirect(`/admin/covers/${coverId}`);
  }
}

type Db = Awaited<ReturnType<typeof adminClient>>;

async function uniqueSlug(db: Db, table: "covers" | "creators" | "collections", base: string, exceptId?: string) {
  let slug = slugify(base);
  for (let n = 2; n < 50; n++) {
    let q = db.from(table).select("id").eq("slug", slug);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${n}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

async function createDraft(
  db: Db,
  d: { title: string; artist: string; year: number; credits?: string | null; note?: string | null },
) {
  const slug = await uniqueSlug(db, "covers", d.title);
  const { data, error } = await db
    .from("covers")
    .insert({
      slug,
      title: d.title,
      artist: d.artist,
      release_year: d.year,
      decade: decadeOf(d.year),
      credits_text: d.credits || null,
      description_html: d.note ? paragraphsToHtml(`Submission note: ${d.note}`) : null,
      status: "draft",
      image_url: "",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "The draft wasn't created.");
  return data.id as string;
}

/** Starts an empty draft from the covers list. */
export async function newCover(form: FormData) {
  const db = await adminClient();
  const title = String(form.get("title") ?? "").trim() || "Untitled cover";
  const artist = String(form.get("artist") ?? "").trim() || "Unknown artist";
  const id = await createDraft(db, { title, artist, year: new Date().getFullYear() });
  redirect(`/admin/covers/${id}`);
}

export type CoverInput = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  release_year: number;
  label: string;
  country: string;
  cover_type_id: string;
  subgenres: string;
  credits_text: string;
  essay: string;
  pull_quote: string;
  color: string;
  accent_color: string;
  image_url: string;
  image_width: number | null;
  image_height: number | null;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  featured: boolean;
  status: "draft" | "published";
  creators: { name: string; role: string }[];
};

export type SaveResult = { ok: boolean; message: string; slug?: string };

const hex = (v: string) => (/^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim().toUpperCase() : null);
const url = (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : null);

export async function saveCover(input: CoverInput): Promise<SaveResult> {
  try {
    const db = await adminClient();
    const year = Number(input.release_year);
    if (!input.title.trim() || !input.artist.trim()) return { ok: false, message: "Add the album title and the artist." };
    if (!Number.isInteger(year) || year < 1970 || year > 2100) return { ok: false, message: "Check the release year." };
    if (input.status === "published" && !input.image_url) {
      return { ok: false, message: "Upload the cover art before publishing." };
    }
    const slug = await uniqueSlug(db, "covers", input.slug || input.title, input.id);
    const spotifyId = input.spotify_url.match(/open\.spotify\.com\/album\/([A-Za-z0-9]+)/)?.[1] ?? null;

    const { error } = await db
      .from("covers")
      .update({
        slug,
        title: input.title.trim(),
        artist: input.artist.trim(),
        release_year: year,
        decade: decadeOf(year),
        label: input.label.trim() || null,
        country: input.country.trim() || null,
        cover_type_id: input.cover_type_id || null,
        subgenres: input.subgenres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        credits_text: input.credits_text.trim() || null,
        description_html: input.essay.trim() ? paragraphsToHtml(input.essay) : null,
        pull_quote: input.pull_quote.trim() || null,
        color: hex(input.color),
        accent_color: hex(input.accent_color),
        image_url: input.image_url,
        image_width: input.image_width,
        image_height: input.image_height,
        spotify_url: url(input.spotify_url),
        spotify_album_id: spotifyId,
        apple_music_url: url(input.apple_music_url),
        youtube_url: url(input.youtube_url),
        featured: input.featured,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);
    if (error) return { ok: false, message: error.message };

    // Creators: match by name, create the ones that are new, then relink.
    const people = input.creators.map((c) => ({ name: c.name.trim(), role: c.role.trim() })).filter((c) => c.name);
    const ids: string[] = [];
    for (const p of people) {
      // Case-insensitive exact match; escape the characters ilike treats as wildcards.
      const exact = p.name.replace(/[\\%_]/g, (m) => `\\${m}`);
      const { data: found } = await db.from("creators").select("id, role").ilike("name", exact).limit(1).maybeSingle();
      if (found) {
        if (p.role && p.role !== found.role) await db.from("creators").update({ role: p.role }).eq("id", found.id);
        ids.push(found.id);
      } else {
        const cslug = await uniqueSlug(db, "creators", p.name);
        const { data: made, error: cErr } = await db
          .from("creators")
          .insert({ slug: cslug, name: p.name, role: p.role || null })
          .select("id")
          .single();
        if (cErr || !made) return { ok: false, message: `Couldn't add ${p.name}: ${cErr?.message}` };
        ids.push(made.id);
      }
    }
    await db.from("cover_creators").delete().eq("cover_id", input.id);
    if (ids.length) {
      const { error: lErr } = await db
        .from("cover_creators")
        .insert([...new Set(ids)].map((creator_id) => ({ cover_id: input.id, creator_id })));
      if (lErr) return { ok: false, message: lErr.message };
    }

    revalidatePath("/", "layout");
    return {
      ok: true,
      slug,
      message: input.status === "published" ? "Saved. The cover is live." : "Saved as a draft. Only admins can see it.",
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteCover(form: FormData) {
  const id = String(form.get("id") ?? "");
  const db = await adminClient();
  await db.from("covers").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/covers");
}

/* Collections ------------------------------------------------------------- */

export async function newCollection(form: FormData) {
  const db = await adminClient();
  const title = String(form.get("title") ?? "").trim().slice(0, 100) || "Untitled collection";
  const slug = await uniqueSlug(db, "collections", title);
  const { data, error } = await db.from("collections").insert({ slug, title }).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "The collection wasn't created.");
  redirect(`/admin/collections/${data.id}`);
}

export async function saveCollection(input: {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  coverIds: string[];
}): Promise<SaveResult> {
  try {
    const db = await adminClient();
    if (!input.title.trim()) return { ok: false, message: "Give the collection a name." };
    const slug = await uniqueSlug(db, "collections", input.title, input.id);
    const { error } = await db
      .from("collections")
      .update({
        slug,
        title: input.title.trim().slice(0, 100),
        description: input.description.trim().slice(0, 600) || null,
        sort_order: Number(input.sort_order) || 99,
      })
      .eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    await db.from("collection_covers").delete().eq("collection_id", input.id);
    if (input.coverIds.length) {
      const { error: iErr } = await db
        .from("collection_covers")
        .insert(input.coverIds.map((cover_id, position) => ({ collection_id: input.id, cover_id, position })));
      if (iErr) return { ok: false, message: iErr.message };
    }
    revalidatePath("/", "layout");
    return { ok: true, slug, message: "Collection saved." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteCollection(form: FormData) {
  const db = await adminClient();
  await db.from("collections").delete().eq("id", String(form.get("id") ?? ""));
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}

/* Feedback ---------------------------------------------------------------- */

export async function markFeedback(form: FormData) {
  const db = await adminClient();
  const status = String(form.get("status")) === "done" ? "done" : "new";
  await db.from("feedback").update({ status }).eq("id", String(form.get("id") ?? ""));
  revalidatePath("/admin/feedback");
}
