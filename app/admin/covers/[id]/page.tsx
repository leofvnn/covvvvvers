import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { plainText } from "@/lib/text";
import { deleteCover } from "../../actions";
import CoverEditor from "./CoverEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit cover", robots: { index: false } };

export default async function EditCover({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await requireAdmin(`/admin/covers/${id}`);
  const [{ data: cover }, { data: types }, { data: links }, { data: creators }] = await Promise.all([
    db.from("covers").select("*").eq("id", id).maybeSingle(),
    db.from("cover_types").select("id, title").order("sort_order"),
    db.from("cover_creators").select("creator_id").eq("cover_id", id),
    db.from("creators").select("id, name, role").order("name"),
  ]);
  if (!cover) notFound();
  const linked = new Set((links ?? []).map((l) => l.creator_id));
  const people = (creators ?? []).filter((c) => linked.has(c.id)).map((c) => ({ name: c.name, role: c.role ?? "" }));

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link> / <Link href="/admin/covers">Covers</Link>
      </p>
      <h1>{cover.title}</h1>
      <CoverEditor
        initial={{
          id: cover.id,
          slug: cover.slug,
          title: cover.title,
          artist: cover.artist,
          release_year: cover.release_year,
          label: cover.label ?? "",
          country: cover.country ?? "",
          cover_type_id: cover.cover_type_id ?? "",
          subgenres: (cover.subgenres ?? []).join(", "),
          credits_text: cover.credits_text ?? "",
          essay: plainText(cover.description_html),
          pull_quote: cover.pull_quote ?? "",
          color: cover.color ?? "",
          accent_color: cover.accent_color ?? "",
          image_url: cover.image_url ?? "",
          image_width: cover.image_width,
          image_height: cover.image_height,
          spotify_url: cover.spotify_url ?? "",
          apple_music_url: cover.apple_music_url ?? "",
          youtube_url: cover.youtube_url ?? "",
          featured: Boolean(cover.featured),
          status: cover.status === "draft" ? "draft" : "published",
          creators: people.length ? people : [{ name: "", role: "" }],
        }}
        types={types ?? []}
        creatorNames={(creators ?? []).map((c) => c.name)}
      />
      <form action={deleteCover} className="danger-zone">
        <input type="hidden" name="id" value={cover.id} />
        <details>
          <summary>Delete this cover</summary>
          <p>This removes the cover, its credits links and every save, rating and list entry for it.</p>
          <button className="button danger" type="submit">
            Delete for good
          </button>
        </details>
      </form>
    </section>
  );
}
