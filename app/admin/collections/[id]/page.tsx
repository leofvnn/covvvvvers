import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { deleteCollection } from "../../actions";
import CollectionEditor from "./CollectionEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit collection", robots: { index: false } };

export default async function EditCollection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await requireAdmin(`/admin/collections/${id}`);
  const [{ data: col }, { data: items }, { data: covers }] = await Promise.all([
    db.from("collections").select("*").eq("id", id).maybeSingle(),
    db.from("collection_covers").select("cover_id, position").eq("collection_id", id).order("position"),
    db.from("covers").select("id, title, artist, release_year, image_url").eq("status", "published").order("title"),
  ]);
  if (!col) notFound();

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link> / <Link href="/admin/collections">Collections</Link>
      </p>
      <h1>{col.title}</h1>
      <CollectionEditor
        initial={{
          id: col.id,
          slug: col.slug,
          title: col.title,
          description: col.description ?? "",
          sort_order: col.sort_order,
          coverIds: (items ?? []).map((i) => i.cover_id),
        }}
        covers={covers ?? []}
      />
      <form action={deleteCollection} className="danger-zone">
        <input type="hidden" name="id" value={col.id} />
        <details>
          <summary>Delete this collection</summary>
          <p>The covers stay in the archive; only the collection goes.</p>
          <button className="button danger" type="submit">
            Delete for good
          </button>
        </details>
      </form>
    </section>
  );
}
