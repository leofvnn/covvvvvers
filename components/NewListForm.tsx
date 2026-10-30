"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function NewListForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getBrowserClient();
    const name = title.trim();
    if (!db || !name) return;
    const { data, error } = await db.from("lists").insert({ user_id: userId, title: name.slice(0, 80) }).select("id").single();
    if (error || !data) {
      setError("The list wasn't created. Try again.");
      return;
    }
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
      <button className="button solid" type="submit" disabled={!title.trim()}>
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
