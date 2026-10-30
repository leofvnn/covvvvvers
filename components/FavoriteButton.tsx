"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

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

  if (userId === undefined) return <span className="fav-placeholder" />;

  if (userId === null) {
    return (
      <Link className="button" href={`/login?next=/covers/${slug}`}>
        Sign in to save this cover
      </Link>
    );
  }

  async function toggle() {
    const db = getBrowserClient();
    if (!db || !userId) return;
    setBusy(true);
    setError("");
    const res = saved
      ? await db.from("favorites").delete().eq("user_id", userId).eq("cover_id", coverId)
      : await db.from("favorites").insert({ user_id: userId, cover_id: coverId });
    setBusy(false);
    if (res.error) {
      setError("The change didn't save. Check your connection and try again.");
      return;
    }
    setSaved(!saved);
  }

  return (
    <>
      <button type="button" className="button" aria-pressed={saved} onClick={toggle} disabled={busy}>
        {saved ? "Saved to your covers" : "Save to your covers"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
