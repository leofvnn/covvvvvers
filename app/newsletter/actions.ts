"use server";

import { getServerClient } from "@/lib/supabase/server";

export type NewsletterState = { ok: boolean; message: string };

export async function subscribe(_prev: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Enter a full email address." };
  const db = await getServerClient();
  if (!db) return { ok: false, message: "The weekly email opens once the site is connected to Supabase." };
  const { error } = await db.rpc("subscribe", { p_email: email });
  if (error) return { ok: false, message: "That didn't go through. Try again in a moment." };
  return { ok: true, message: "You're on the list. The next cover of the week arrives on Monday." };
}
