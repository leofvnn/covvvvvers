"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoriteButton({ coverId, slug }: { coverId: string; slug: string }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getBrowserClient();
    if (!db) {
      setUserId(null);
      return;
    }
    db.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: row } = await db
        .from("favorites")
        .select("cover_id")
        .eq("user_id", id)
        .eq("cover_id", coverId)
        .maybeSingle();
      setSaved(Boolean(row));
    });
  }, [coverId]);

  if (userId === undefined) return <span className="save-placeholder" />;

  if (userId === null) {
    return (
      <Link className="save" href={`/login?next=/covers/${slug}`}>
        <Heart filled={false} />
        Save
      </Link>
    );
  }

  async function toggle() {
    const db = getBrowserClient();
    if (!db || !userId) return;
    const next = !saved;
    setSaved(next);
    setBusy(true);
    setError("");
    const res = next
      ? await db.from("favorites").insert({ user_id: userId, cover_id: coverId })
      : await db.from("favorites").delete().eq("user_id", userId).eq("cover_id", coverId);
    setBusy(false);
    if (res.error) {
      setSaved(!next);
      setError("That didn't save. Check your connection and try again.");
    }
  }

  return (
    <>
      <button type="button" className="save" aria-pressed={saved} onClick={toggle} disabled={busy}>
        <Heart filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
