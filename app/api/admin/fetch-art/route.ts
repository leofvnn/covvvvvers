import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { recordImage } from "@/lib/images";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH = 3;
const UA = "Covvvvvers/1.0 ( https://covvvvvers.com )";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\$/g, "s")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const loose = (a: string, b: string) => {
  const x = norm(a);
  const y = norm(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};
const mainArtist = (a: string) => a.split(/ feat\. | & | and |, |\/ /i)[0].trim();
const phrase = (s: string) => `"${s.replace(/["\\]/g, " ").trim()}"`;

type Group = { id: string; title: string; "primary-type"?: string; "first-release-date"?: string; "artist-credit"?: { name?: string; artist?: { name?: string } }[] };

/** The MusicBrainz release group for an album: matching title and artist, the album version first, earliest first. */
async function findGroup(title: string, artist: string, year: number) {
  const a = mainArtist(artist);
  const q = `releasegroup:${phrase(title)} AND artist:${phrase(a)}`;
  const res = await fetch(`https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(q)}&fmt=json&limit=25`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`MusicBrainz returned ${res.status}`);
  const groups: Group[] = (await res.json())["release-groups"] ?? [];
  const ok = groups.filter((g) => loose(g.title, title) && (g["artist-credit"] ?? []).some((c) => loose(c.artist?.name ?? c.name ?? "", a)));
  const y = (g: Group) => Number((g["first-release-date"] ?? "").slice(0, 4)) || 9999;
  ok.sort(
    (x, z) =>
      Number(norm(z.title) === norm(title)) - Number(norm(x.title) === norm(title)) ||
      Number(z["primary-type"] === "Album") - Number(x["primary-type"] === "Album") ||
      Math.abs(y(x) - year) - Math.abs(y(z) - year),
  );
  return ok[0] ?? null;
}

const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

/** Main colour: the image's dominant colour. Accent: the average of the brighter half, or the darker half on light covers. */
async function colours(img: Buffer) {
  const s = await sharp(img).stats();
  const main = hex(s.dominant.r, s.dominant.g, s.dominant.b);
  const { data } = await sharp(img).resize(32, 32, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);
  const lum = (p: number[]) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  const mainLum = lum([s.dominant.r, s.dominant.g, s.dominant.b]);
  const pool = px.filter((p) => (mainLum < 128 ? lum(p) > mainLum + 40 : lum(p) < mainLum - 40));
  const pick = pool.length ? pool : px;
  const avg = [0, 1, 2].map((k) => pick.reduce((n, p) => n + p[k], 0) / pick.length) as [number, number, number];
  return [main, hex(...avg)];
}

/**
 * Fills in the next few covers that have no image yet: finds the album on MusicBrainz,
 * downloads the front cover from the Cover Art Archive, stores a full-size and a 600px copy
 * in the "covers" bucket, and saves the image, its size and its colours on the cover.
 * Runs as the signed-in admin, so storage and table policies do the permission checks.
 */
export async function POST() {
  const db = await getServerClient();
  if (!db) return NextResponse.json({ error: "Supabase isn't connected." }, { status: 400 });
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { data: me } = await db.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return NextResponse.json({ error: "Only admins can fetch cover art." }, { status: 403 });

  const { data: covers, error } = await db
    .from("covers")
    .select("id, slug, title, artist, release_year, color, accent_color")
    .is("image_url", null)
    .order("release_year", { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bucket = db.storage.from("covers");
  const done: string[] = [];
  const failed: string[] = [];

  for (const [i, c] of (covers ?? []).entries()) {
    try {
      // The image already found for this cover (Wikipedia, Cover Art Archive or Apple Music),
      // else a fresh MusicBrainz lookup.
      const known = recordImage(c.title, c.artist);
      let url = known?.full ?? known?.src;
      if (!url) {
        if (i > 0) await sleep(1100); // MusicBrainz allows one request a second.
        const group = await findGroup(c.title, c.artist, c.release_year);
        if (!group) throw new Error("not found on MusicBrainz");
        url = `https://coverartarchive.org/release-group/${group.id}/front`;
      }
      const art = await fetch(url, { cache: "no-store", redirect: "follow", headers: { "User-Agent": UA } });
      if (!art.ok) throw new Error(`couldn't download the cover (${art.status})`);
      const original = Buffer.from(await art.arrayBuffer());
      const full = await sharp(original).rotate().resize(2000, 2000, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer({ resolveWithObject: true });
      const thumb = await sharp(original).rotate().resize(600, 600, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer();
      const opts = { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" };
      const a = await bucket.upload(`${c.slug}.jpg`, full.data, opts);
      const b = await bucket.upload(`${c.slug}-600.jpg`, thumb, opts);
      if (a.error || b.error) throw new Error((a.error ?? b.error)!.message);
      const [main, accent] = await colours(full.data);
      const { error: upErr } = await db
        .from("covers")
        .update({
          image_url: `${bucket.getPublicUrl(`${c.slug}.jpg`).data.publicUrl}?v=${Date.now()}`,
          image_width: full.info.width,
          image_height: full.info.height,
          color: c.color || main,
          accent_color: c.accent_color || accent,
        })
        .eq("id", c.id);
      if (upErr) throw new Error(upErr.message);
      done.push(c.title);
    } catch (e) {
      // Mark it so the next batch moves on; an admin can upload this one by hand.
      await db.from("covers").update({ image_url: "" }).eq("id", c.id);
      failed.push(`${c.title} (${c.artist}): ${(e as Error).message}`);
    }
  }

  const { count } = await db.from("covers").select("id", { count: "exact", head: true }).is("image_url", null);
  if (done.length) revalidatePath("/", "layout");
  return NextResponse.json({ done, failed, remaining: count ?? 0 });
}
