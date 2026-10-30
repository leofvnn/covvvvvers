import type { SupabaseClient } from "@supabase/supabase-js";

export type ListRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
};

/** Lists with the ids of their covers, newest change first. Row level security decides what's visible. */
export async function loadLists(db: SupabaseClient, filter: { userId: string; publicOnly?: boolean }) {
  let q = db.from("lists").select("*").eq("user_id", filter.userId).order("updated_at", { ascending: false });
  if (filter.publicOnly) q = q.eq("is_public", true);
  const { data: lists } = await q;
  if (!lists?.length) return [];
  const { data: items } = await db
    .from("list_items")
    .select("list_id, cover_id, added_at")
    .in(
      "list_id",
      lists.map((l) => l.id),
    )
    .order("added_at", { ascending: false });
  return (lists as ListRow[]).map((l) => ({
    ...l,
    coverIds: (items ?? []).filter((i) => i.list_id === l.id).map((i) => i.cover_id as string),
  }));
}
