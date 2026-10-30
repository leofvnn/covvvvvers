import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CoverGrid from "@/components/CoverGrid";
import { getCovers, toCard } from "@/lib/data";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your covers", robots: { index: false } };

const STATUS: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved for the collection",
  rejected: "Not added",
};

export default async function MePage() {
  const db = await getServerClient();
  if (!db) redirect("/login");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login?next=/me");

  const [favs, subs, profile, covers] = await Promise.all([
    db.from("favorites").select("cover_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    db.from("submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    db.from("profiles").select("display_name, is_admin").eq("id", user.id).maybeSingle(),
    getCovers(),
  ]);

  const byId = new Map(covers.map((c) => [c.id, c]));
  const saved = (favs.data ?? []).map((f) => byId.get(f.cover_id)).filter(Boolean) as typeof covers;

  return (
    <>
      <header className="page-head">
        <h1>Your covers</h1>
        <p>Signed in as {user.email}.</p>
        <div className="intro-actions">
          {profile.data?.is_admin && (
            <Link className="button" href="/admin">
              Review submissions
            </Link>
          )}
          <Link className="button" href="/submit">
            Submit a cover
          </Link>
          <form action="/auth/signout" method="post">
            <button className="button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section aria-labelledby="saved-h">
        <h2 id="saved-h" className="section-title">
          Saved
        </h2>
        <CoverGrid covers={saved.map(toCard)} emptyText="Nothing saved yet. Open any cover and tap Save." />
      </section>

      <section aria-labelledby="subs-h" className="subs">
        <h2 id="subs-h" className="section-title">
          Your submissions
        </h2>
        {subs.data && subs.data.length > 0 ? (
          <ul className="sub-list">
            {subs.data.map((s) => (
              <li key={s.id}>
                <strong>{s.album_title}</strong> by {s.artist}
                {s.release_year ? `, ${s.release_year}` : ""}
                <span className={`status status-${s.status}`}>{STATUS[s.status]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">
            You haven't suggested any albums yet. <Link href="/submit">Submit a cover</Link> you think belongs here.
          </p>
        )}
      </section>
    </>
  );
}
