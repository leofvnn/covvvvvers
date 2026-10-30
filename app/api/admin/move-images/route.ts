import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isWix, wixDownloads } from "@/lib/img";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH = 6;

async function download(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Wix returned ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Moves the next few covers from the Wix CDN into the Supabase "covers" bucket.
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
  if (!me?.is_admin) return NextResponse.json({ error: "Only admins can move images." }, { status: 403 });

  const bucket = db.storage.from("covers");
  const upload = async (path: string, url: string) => {
    const body = await download(url);
    const { error } = await bucket.upload(path, body, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return bucket.getPublicUrl(path).data.publicUrl;
  };

  const failed: string[] = [];
  const moved: string[] = [];

  // Covers first, then the cover type hero images.
  const { data: covers, error } = await db
    .from("covers")
    .select("id, slug, title, image_url")
    .like("image_url", "%static.wixstatic.com%")
    .order("release_year", { ascending: false })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const c of covers ?? []) {
    try {
      const src = wixDownloads(c.image_url);
      await upload(`${c.slug}-600.jpg`, src.thumb);
      const full = await upload(`${c.slug}.jpg`, src.full);
      const { error: upErr } = await db.from("covers").update({ image_url: full }).eq("id", c.id);
      if (upErr) throw new Error(upErr.message);
      moved.push(c.title);
    } catch (e) {
      failed.push(`${c.title}: ${(e as Error).message}`);
    }
  }

  if (!covers?.length) {
    const { data: types } = await db.from("cover_types").select("id, slug, title, hero_image");
    for (const t of (types ?? []).filter((t) => t.hero_image && isWix(t.hero_image))) {
      try {
        const src = wixDownloads(t.hero_image!);
        await upload(`types/${t.slug}-600.jpg`, src.thumb);
        const full = await upload(`types/${t.slug}.jpg`, src.full);
        const { error: upErr } = await db.from("cover_types").update({ hero_image: full }).eq("id", t.id);
        if (upErr) throw new Error(upErr.message);
        moved.push(`${t.title} (cover type)`);
      } catch (e) {
        failed.push(`${t.title}: ${(e as Error).message}`);
      }
    }
  }

  const [{ count: coversLeft }, { data: typesLeft }] = await Promise.all([
    db.from("covers").select("id", { count: "exact", head: true }).like("image_url", "%static.wixstatic.com%"),
    db.from("cover_types").select("id").like("hero_image", "%static.wixstatic.com%"),
  ]);
  const remaining = (coversLeft ?? 0) + (typesLeft?.length ?? 0);

  if (moved.length) revalidatePath("/", "layout");
  return NextResponse.json({ moved, failed, remaining });
}
