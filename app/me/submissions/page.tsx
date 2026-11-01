import Link from "next/link";
import { getAccount } from "@/lib/account";

const STATUS: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved for the collection",
  rejected: "Not added",
};

export default async function SubmissionsPage() {
  const { db, user } = await getAccount("/me/submissions");
  const { data } = await db.from("submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <section className="account-section subs" aria-label="Your submissions">
      {data && data.length > 0 ? (
        <ul className="sub-list">
          {data.map((s) => (
            <li key={s.id}>
              <span>
                <strong>{s.album_title}</strong> by {s.artist}
                {s.release_year ? `, ${s.release_year}` : ""}
              </span>
              <span className={`status status-${s.status}`}>{STATUS[s.status]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">
          You haven't suggested any albums yet. <Link href="/submit">Submit a cover</Link> you think belongs here.
        </p>
      )}
    </section>
  );
}
