import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { markFeedback } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Feedback", robots: { index: false } };

const TOPIC: Record<string, string> = {
  general: "General",
  idea: "Idea",
  problem: "Problem",
  correction: "Correction",
};

export default async function AdminFeedback() {
  const { db } = await requireAdmin("/admin/feedback");
  const { data } = await db.from("feedback").select("*").order("created_at", { ascending: false }).limit(300);
  const items = data ?? [];
  const groups: [string, typeof items][] = [
    ["New", items.filter((i) => i.status === "new")],
    ["Done", items.filter((i) => i.status === "done")],
  ];

  return (
    <section className="panel wide">
      <p className="crumb">
        <Link href="/admin">Admin</Link>
      </p>
      <h1>Feedback</h1>
      {groups.map(([title, list]) => (
        <section key={title} className="review-group">
          <h2>
            {title} ({list.length})
          </h2>
          {list.length ? (
            <ul>
              {list.map((f) => (
                <li key={f.id} className="review">
                  <div>
                    <p className="review-meta">
                      {TOPIC[f.topic] ?? f.topic}, {new Date(f.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      {f.page && <> on {f.page}</>}
                    </p>
                    <p className="review-note">{f.message}</p>
                    {f.email && (
                      <p>
                        <a href={`mailto:${f.email}`}>{f.email}</a>
                      </p>
                    )}
                  </div>
                  <form action={markFeedback} className="review-actions">
                    <input type="hidden" name="id" value={f.id} />
                    {f.status === "new" ? (
                      <button className="button" name="status" value="done">
                        Mark as done
                      </button>
                    ) : (
                      <button className="button" name="status" value="new">
                        Move back to new
                      </button>
                    )}
                  </form>
                </li>
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
