import Link from "next/link";
import CoverGrid from "@/components/CoverGrid";
import { getAccount } from "@/lib/account";
import { getCovers, getFeatured, getTypes, toCard } from "@/lib/data";

/** Bookmarked: the default list. Every bookmark lands here unless it's moved to another list. */
export default async function SavedPage() {
  const { db, user } = await getAccount("/me/saved");
  const [favs, covers, types, featured] = await Promise.all([
    db.from("favorites").select("cover_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    getCovers(),
    getTypes(),
    getFeatured(),
  ]);
  const byId = new Map(covers.map((c) => [c.id, c]));
  const saved = (favs.data ?? []).map((f) => byId.get(f.cover_id)).filter(Boolean) as typeof covers;

  if (!saved.length) {
    // A new account: three covers to start with, changing every day.
    const day = Math.floor(Date.now() / 86400000);
    const picks = [featured, ...[0, 1].map((i) => covers[(day * 7 + i * 53) % covers.length])].filter(
      (c, i, a) => c && a.findIndex((x) => x?.id === c.id) === i,
    );
    return (
      <section className="account-section">
        <p className="account-back">
          <Link href="/me/lists">← Lists</Link>
        </p>
        <div className="account-welcome">
          <h2 className="account-list-title">Bookmarked</h2>
          <h3>Start by bookmarking a cover</h3>
          <p>Tap Bookmark on any cover and it lands here. You can move it into your own lists later.</p>
        </div>
        <CoverGrid covers={picks.map((c) => toCard(c))} eager={3} />
      </section>
    );
  }

  return (
    <section className="account-section" aria-label="Bookmarked covers">
      <p className="account-back">
        <Link href="/me/lists">← Lists</Link>
      </p>
      <div className="account-welcome">
        <h2 className="account-list-title">Bookmarked</h2>
        <p>Your default list. Everything you bookmark lands here unless you choose another list.</p>
      </div>
      <CoverGrid
        covers={saved.map((c) => toCard(c, { withText: true }))}
        filters
        types={types.filter((t) => t.count).map((t) => ({ slug: t.slug, title: t.title }))}
      />
    </section>
  );
}
