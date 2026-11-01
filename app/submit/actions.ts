"use server";

import { getServerClient } from "@/lib/supabase/server";

export type SubmitState = { ok: boolean; message: string };

const clip = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function submitCover(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const db = await getServerClient();
  if (!db) return { ok: false, message: "Submissions open once the site is connected to Supabase." };
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { ok: false, message: "Your session ended. Sign in again to send this cover." };

  const album_title = clip(form.get("album_title"), 200);
  const artist = clip(form.get("artist"), 200);
  const yearRaw = clip(form.get("release_year"), 4);
  const link = clip(form.get("link"), 500);
  const release_year = yearRaw ? Number(yearRaw) : null;

  if (!album_title || !artist) return { ok: false, message: "Add the album title and the artist." };
  if (release_year !== null && (!Number.isInteger(release_year) || release_year < 1979 || release_year > 2100)) {
    return { ok: false, message: "Enter the release year as four digits, 1979 or later." };
  }
  if (link && !/^https?:\/\//i.test(link)) return { ok: false, message: "Links need to start with https://" };

  const { error } = await db.from("submissions").insert({
    user_id: user.id,
    album_title,
    artist,
    release_year,
    link: link || null,
    cover_credit: clip(form.get("cover_credit"), 300) || null,
    note: clip(form.get("note"), 2000) || null,
  });
  if (error) return { ok: false, message: "The cover didn't send. Try again in a moment." };
  return { ok: true, message: `Sent. ${album_title} is waiting for review, and you can follow it in your account.` };
}
