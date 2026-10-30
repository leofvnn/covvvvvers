import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { squareImage } from "@/lib/img";
import { newCover } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit covers", robots: { index: false } };

export default async function AdminCovers({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { db } = await requireAdmin("/admin/covers");
  const { q = "", status = "" } = await searchParams;
  let query = db
    .from("covers")
    .select("id, slug, title, artist, release_year, image_url, color, status, updated_at")
    .order("status", { ascending: true })
    .order("release_year", { ascending: false })
    .order("title");
  if (status === "draft" || status === "published") query = query.eq("status", status);
  if (q.trim()) query = query.or(`title.ilike.%${q.replace(/[%,()]/g, "")}%,artist.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data: covers } = await query;

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link>
      </p>
      <h1>Covers</h1>
      <form action={newCover} className="admin-new">
        <input name="title" placeholder="Album title" aria-label="Album title" required />
        <input name="artist" placeholder="Artist" aria-label="Artist" required />
        <button className="button solid" type="submit">
          Start a new cover
        </button>
      </form>
      <form className="admin-search" method="get">
        <input name="q" defaultValue={q} placeholder="Find a cover" aria-label="Find a cover" type="search" />
        <select name="status" defaultValue={status} aria-label="Status">
          <option value="">All</option>
          <option value="draft">Drafts</option>
          <option value="published">Live</option>
        </select>
        <button className="button" type="submit">
          Show
        </button>
      </form>
      <ul className="admin-list">
        {(covers ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/admin/covers/${c.id}`}>
              {c.image_url ? (
                <img src={squareImage(c.image_url, 120)} alt="" width={48} height={48} loading="lazy" />
              ) : (
                <span className="admin-noimg" style={{ backgroundColor: c.color ?? undefined }} />
              )}
              <span className="admin-list-text">
                <strong>{c.title}</strong>
                <span>
                  {c.artist}, {c.release_year}
                </span>
              </span>
              {c.status === "draft" && <span className="badge">Draft</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
