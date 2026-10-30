import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoverGrid from "@/components/CoverGrid";
import ListCards from "@/components/ListCards";
import { getCovers, toCard } from "@/lib/data";
import { loadLists } from "@/lib/lists";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ username: string }> };

async function load(username: string) {
  if (!/^[a-z0-9_]{3,24}$/i.test(username)) return null;
  const db = await getServerClient();
  if (!db) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("id, display_name, username, bio, is_public")
    .ilike("username", username)
    .eq("is_public", true)
    .maybeSingle();
  if (!profile) return null;
  const [{ data: favs }, lists] = await Promise.all([
    db.from("favorites").select("cover_id, created_at").eq("user_id", profile.id).order("created_at", { ascending: false }),
    loadLists(db, { userId: profile.id, publicOnly: true }),
  ]);
  return { profile, favs: favs ?? [], lists };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load((await params).username);
  if (!found) return { title: "Profile" };
  const name = found.profile.display_name || found.profile.username;
  return { title: name, description: found.profile.bio || `${name}'s saved rap album covers on Covvvvvers.` };
}

export default async function ProfilePage({ params }: Params) {
  const found = await load((await params).username);
  if (!found) notFound();
  const { profile, favs, lists } = found;
  const covers = await getCovers();
  const byId = new Map(covers.map((c) => [c.id, c]));
  const saved = favs.map((f) => byId.get(f.cover_id)).filter(Boolean) as typeof covers;
  const listCards = lists.map((l) => ({ ...l, covers: l.coverIds.map((id) => byId.get(id)!).filter(Boolean) }));

  return (
    <>
      <header className="page-head">
        <p className="crumb">@{profile.username}</p>
        <h1>{profile.display_name || profile.username}</h1>
        {profile.bio && <p>{profile.bio}</p>}
        <p className="page-count">
          {saved.length} saved {saved.length === 1 ? "cover" : "covers"}, {lists.length}{" "}
          {lists.length === 1 ? "list" : "lists"}
        </p>
      </header>
      {listCards.length > 0 && (
        <section aria-labelledby="lists-h">
          <h2 id="lists-h" className="section-title">
            Lists
          </h2>
          <ListCards lists={listCards} />
        </section>
      )}
      <section aria-labelledby="saved-h">
        <h2 id="saved-h" className="section-title">
          Saved
        </h2>
        <CoverGrid covers={saved.map((c) => toCard(c))} emptyText="Nothing saved yet." />
      </section>
    </>
  );
}
