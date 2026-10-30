import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoverGrid from "@/components/CoverGrid";
import ListOwnerTools from "@/components/ListOwnerTools";
import { getCovers, toCard } from "@/lib/data";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = await getServerClient();
  if (!db) return null;
  const { data: list } = await db.from("lists").select("*").eq("id", id).maybeSingle();
  if (!list) return null;
  const [{ data: items }, { data: owner }, { data: auth }] = await Promise.all([
    db.from("list_items").select("cover_id, added_at").eq("list_id", id).order("added_at", { ascending: false }),
    db.from("profiles").select("display_name").eq("id", list.user_id).maybeSingle(),
    db.auth.getUser(),
  ]);
  return { list, items: items ?? [], owner, isOwner: auth.user?.id === list.user_id };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load((await params).id);
  if (!found) return { title: "List" };
  return { title: found.list.title, description: found.list.description ?? `A list of rap album covers on Covvvvvers.` };
}

export default async function ListPage({ params }: Params) {
  const found = await load((await params).id);
  if (!found) notFound();
  const { list, items, owner, isOwner } = found;
  const covers = await getCovers();
  const byId = new Map(covers.map((c) => [c.id, c]));
  const shown = items.map((i) => byId.get(i.cover_id)).filter(Boolean) as typeof covers;
  const by = owner?.display_name || "a member";

  return (
    <>
      <header className="page-head">
        <p className="crumb">List by {isOwner ? "you" : by}</p>
        <h1>{list.title}</h1>
        {list.description && <p>{list.description}</p>}
        <p className="page-count">
          {shown.length} {shown.length === 1 ? "cover" : "covers"}
          {!list.is_public && ", only you can see this list"}
        </p>
        {isOwner && (
          <ListOwnerTools
            id={list.id}
            title={list.title}
            description={list.description ?? ""}
            isPublic={list.is_public}
            covers={shown.map((c) => ({ id: c.id, title: c.title }))}
          />
        )}
      </header>
      <CoverGrid
        covers={shown.map((c) => toCard(c))}
        emptyText={isOwner ? "This list is empty. Open any cover and choose Add to list." : "This list is empty."}
      />
    </>
  );
}
