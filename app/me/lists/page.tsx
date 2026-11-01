import ListCards from "@/components/ListCards";
import NewListForm from "@/components/NewListForm";
import { getAccount } from "@/lib/account";
import { getCovers } from "@/lib/data";
import { loadLists } from "@/lib/lists";

export default async function ListsPage() {
  const { db, user } = await getAccount("/me/lists");
  const [lists, favs, covers] = await Promise.all([
    loadLists(db, { userId: user.id }),
    db.from("favorites").select("cover_id").eq("user_id", user.id).order("created_at", { ascending: false }),
    getCovers(),
  ]);
  const byId = new Map(covers.map((c) => [c.id, c]));
  // Bookmarked comes first: the default list every bookmark goes to unless another is chosen.
  const saved = {
    id: "saved",
    title: "Bookmarked",
    is_public: false,
    href: "/me/saved",
    note: "default list",
    covers: (favs.data ?? []).map((f) => byId.get(f.cover_id)!).filter(Boolean),
  };
  const cards = [saved, ...lists.map((l) => ({ ...l, covers: l.coverIds.map((id) => byId.get(id)!).filter(Boolean) }))];
  return (
    <section className="account-section" aria-label="Your lists">
      <NewListForm userId={user.id} />
      <ListCards lists={cards} />
      {lists.length === 0 && (
        <p className="empty">
          Bookmarks go to Bookmarked. Make your own lists, like Best 90s covers, here or with Change list on any bookmarked cover.
        </p>
      )}
    </section>
  );
}
