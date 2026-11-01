"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startProgress } from "@/lib/progress";
import { getBrowserClient } from "@/lib/supabase/client";

export default function NewListForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getBrowserClient();
    const name = title.trim();
    if (!db || !name) return;
    setBusy(true);
    const { data, error } = await db.from("lists").insert({ user_id: userId, title: name.slice(0, 80), is_public: false }).select("id").single();
    if (error || !data) {
      setError("The list wasn't created. Try again.");
      setBusy(false);
      return;
    }
    startProgress();
    router.push(`/lists/${data.id}`);
  };

  return (
    <form className="list-new page-pad" onSubmit={create}>
      <label className="visually-hidden" htmlFor="new-list-me">
        New list name
      </label>
      <input
        id="new-list-me"
        value={title}
        maxLength={80}
        placeholder="Name a new list"
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="button solid" type="submit" disabled={busy || !title.trim()} aria-busy={busy}>
        Create list
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
