import ListCards from "@/components/ListCards";
import NewListForm from "@/components/NewListForm";
import { getAccount } from "@/lib/account";
import { getCovers } from "@/lib/data";
import { loadLists } from "@/lib/lists";

export default async function ListsPage() {
  const { db, user } = await getAccount("/me/lists");
  const [lists, covers] = await Promise.all([loadLists(db, { userId: user.id }), getCovers()]);
  const byId = new Map(covers.map((c) => [c.id, c]));
  const cards = lists.map((l) => ({ ...l, covers: l.coverIds.map((id) => byId.get(id)!).filter(Boolean) }));
  return (
    <section className="account-section" aria-label="Your lists">
      <NewListForm userId={user.id} />
      {cards.length > 0 ? (
        <ListCards lists={cards} />
      ) : (
        <p className="empty">
          Lists are your own collections, like Best 90s covers. Make one here, or bookmark a cover and choose Change list.
        </p>
      )}
    </section>
  );
}
