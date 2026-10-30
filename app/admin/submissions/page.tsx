import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { reviewSubmission } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Submissions", robots: { index: false } };

type Sub = {
  id: string;
  user_id: string;
  album_title: string;
  artist: string;
  release_year: number | null;
  link: string | null;
  cover_credit: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function Row({ s, who }: { s: Sub; who: string }) {
  return (
    <li className="review">
      <div>
        <p className="review-title">
          <strong>{s.album_title}</strong> by {s.artist}
          {s.release_year ? `, ${s.release_year}` : ""}
        </p>
        <p className="review-meta">
          From {who} on {new Date(s.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
        </p>
        {s.cover_credit && <p>Cover: {s.cover_credit}</p>}
        {s.note && <p className="review-note">{s.note}</p>}
        {s.link && (
          <p>
            <a href={s.link} target="_blank" rel="noopener noreferrer">
              Open the album
            </a>
          </p>
        )}
      </div>
      <form action={reviewSubmission} className="review-actions">
        <input type="hidden" name="id" value={s.id} />
        {s.status !== "approved" && (
          <>
            <button className="button solid" name="status" value="draft">
              Approve and start a draft
            </button>
            <button className="button" name="status" value="approved">
              Approve only
            </button>
          </>
        )}
        {s.status !== "rejected" && (
          <button className="button" name="status" value="rejected">
            Reject
          </button>
        )}
        {s.status !== "pending" && (
          <button className="button" name="status" value="pending">
            Move back to pending
          </button>
        )}
      </form>
    </li>
  );
}

export default async function SubmissionsPage() {
  const { db } = await requireAdmin("/admin/submissions");

  const { data } = await db.from("submissions").select("*").order("created_at", { ascending: false }).limit(200);
  const subs = (data ?? []) as Sub[];
  const ids = [...new Set(subs.map((s) => s.user_id))];
  const { data: people } = ids.length
    ? await db.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string | null }[] };
  const name = new Map((people ?? []).map((p) => [p.id, p.display_name ?? "a member"]));

  const groups: [string, Sub[]][] = [
    ["Waiting for review", subs.filter((s) => s.status === "pending")],
    ["Approved", subs.filter((s) => s.status === "approved")],
    ["Rejected", subs.filter((s) => s.status === "rejected")],
  ];

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link>
      </p>
      <h1>Submissions</h1>
      <p>Approve and start a draft to turn a suggestion into a cover you can finish in the editor.</p>
      {groups.map(([title, list]) => (
        <section key={title} className="review-group">
          <h2>
            {title} ({list.length})
          </h2>
          {list.length ? (
            <ul>
              {list.map((s) => (
                <Row key={s.id} s={s} who={name.get(s.user_id) ?? "a member"} />
              ))}
            </ul>
          ) : (
            <p className="empty">None right now.</p>
          )}
        </section>
      ))}
    </section>
  );
}
