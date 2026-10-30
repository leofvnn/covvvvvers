"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

/** Members rate the cover art only, 1 to 5. Everyone sees the average. */
export default function Rating({ coverId, slug }: { coverId: string; slug: string }) {
  const [avg, setAvg] = useState<{ average: number | null; votes: number } | null>(null);
  const [mine, setMine] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");

  const loadAverage = async () => {
    const db = getBrowserClient();
    if (!db) return;
    const { data } = await db.rpc("cover_rating", { p_cover: coverId });
    const row = Array.isArray(data) ? data[0] : data;
    if (row) setAvg({ average: row.average === null ? null : Number(row.average), votes: row.votes });
  };

  useEffect(() => {
    const db = getBrowserClient();
    if (!db) {
      setUserId(null);
      return;
    }
    loadAverage();
    db.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: row } = await db.from("ratings").select("score").eq("user_id", id).eq("cover_id", coverId).maybeSingle();
      setMine(row?.score ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverId]);

  const rate = async (score: number) => {
    const db = getBrowserClient();
    if (!db || !userId) return;
    const prev = mine;
    setMine(score);
    setError("");
    const { error } = await db.from("ratings").upsert({ user_id: userId, cover_id: coverId, score });
    if (error) {
      setMine(prev);
      setError("Your rating didn't save. Try again.");
      return;
    }
    navigator.vibrate?.(10);
    loadAverage();
  };

  const shown = hover || mine || 0;

  return (
    <div className="rating">
      <p className="rating-label">
        Rate the cover art
        {avg && avg.votes > 0 && (
          <span className="rating-avg">
            {" "}
            {avg.average?.toFixed(1)} from {avg.votes} {avg.votes === 1 ? "rating" : "ratings"}
          </span>
        )}
      </p>
      {userId ? (
        <div className="stars" role="radiogroup" aria-label="Your rating of the cover art" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={mine === n}
              aria-label={`${n} out of 5`}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              data-on={n <= shown || undefined}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"
                  fill={n <= shown ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      ) : userId === null ? (
        <Link href={`/login?next=/covers/${slug}`} className="rating-signin">
          Sign in to rate it
        </Link>
      ) : (
        <div className="stars-placeholder" />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
