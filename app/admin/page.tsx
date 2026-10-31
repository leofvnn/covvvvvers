import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import FetchArt from "./FetchArt";
import MoveImages from "./MoveImages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminHome() {
  const { db } = await requireAdmin("/admin");
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [published, drafts, pending, feedback, subscribers, coversOnWix, typesOnWix, noImage] = await Promise.all([
    count(db.from("covers").select("id", { count: "exact", head: true }).eq("status", "published")),
    count(db.from("covers").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(db.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(db.from("feedback").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(db.from("subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null)),
    count(db.from("covers").select("id", { count: "exact", head: true }).like("image_url", "%static.wixstatic.com%")),
    count(db.from("cover_types").select("id", { count: "exact", head: true }).like("hero_image", "%static.wixstatic.com%")),
    count(db.from("covers").select("id", { count: "exact", head: true }).is("image_url", null)),
  ]);

  const tiles = [
    { href: "/admin/covers", label: "Covers", note: `${published} live${drafts ? `, ${drafts} drafts` : ""}` },
    { href: "/admin/submissions", label: "Submissions", note: pending ? `${pending} waiting for review` : "Nothing waiting" },
    { href: "/admin/feedback", label: "Feedback", note: feedback ? `${feedback} new` : "Nothing new" },
  ];

  return (
    <section className="panel wide">
      <h1>Admin</h1>
      <p>{subscribers} people get the weekly email.</p>
      <ul className="admin-tiles">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href}>
              <span className="admin-tile-label">{t.label}</span>
              <span className="admin-tile-note">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
      {coversOnWix + typesOnWix > 0 && (
        <section className="review-group">
          <h2>Cover images</h2>
          <MoveImages remaining={coversOnWix + typesOnWix} />
        </section>
      )}
      {noImage > 0 && (
        <section className="review-group">
          <h2>New covers</h2>
          <FetchArt remaining={noImage} />
        </section>
      )}
    </section>
  );
}
