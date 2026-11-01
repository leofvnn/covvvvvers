import { redirect } from "next/navigation";
import { cache } from "react";
import { getServerClient } from "./supabase/server";

/** The signed-in member and their profile, for the account pages. Sends anyone else to sign in. */
export const getAccount = cache(async (next = "/me") => {
  const db = await getServerClient();
  if (!db) redirect("/login");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const { data: profile } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return {
    db,
    user,
    profile: (profile ?? {}) as { display_name?: string | null; is_admin?: boolean; avatar_cover_id?: string | null },
  };
});
