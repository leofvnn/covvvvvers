import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { newCollection } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit collections", robots: { index: false } };

export default async function AdminCollections() {
  const { db } = await requireAdmin("/admin/collections");
  const [{ data: collections }, { data: items }] = await Promise.all([
    db.from("collections").select("id, title, slug, sort_order").order("sort_order").order("title"),
    db.from("collection_covers").select("collection_id"),
  ]);
  const count = (id: string) => (items ?? []).filter((i) => i.collection_id === id).length;

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link>
      </p>
      <h1>Collections</h1>
      <form action={newCollection} className="admin-new">
        <input name="title" placeholder="Name of the new collection" aria-label="Collection name" required />
        <button className="button solid" type="submit">
          Create collection
        </button>
      </form>
      <ul className="admin-list">
        {(collections ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/admin/collections/${c.id}`}>
              <span className="admin-list-text">
                <strong>{c.title}</strong>
                <span>
                  {count(c.id)} covers, shown {ordinal(c.sort_order)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
