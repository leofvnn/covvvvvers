"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type List = { id: string; title: string; has: boolean };

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h11M4 12h11M4 18h7M18 15v6M15 18h6" />
    </svg>
  );
}

/** Adds the cover to one of your lists, or to a new one. */
export default function AddToList({ coverId, slug }: { coverId: string; slug: string }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [lists, setLists] = useState<List[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const db = getBrowserClient();
    if (!db) {
      setUserId(null);
      return;
    }
    db.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
  }, []);

  const load = async () => {
    const db = getBrowserClient();
    if (!db || !userId) return;
    const [{ data: ls }, { data: items }] = await Promise.all([
      db.from("lists").select("id, title").eq("user_id", userId).order("updated_at", { ascending: false }),
      db.from("list_items").select("list_id").eq("cover_id", coverId),
    ]);
    const inList = new Set((items ?? []).map((i) => i.list_id));
    setLists((ls ?? []).map((l) => ({ id: l.id, title: l.title, has: inList.has(l.id) })));
  };

  const openDialog = async () => {
    setError("");
    dialog.current?.showModal();
    await load();
  };

  const toggle = async (l: List) => {
    const db = getBrowserClient();
    if (!db) return;
    setLists((all) => all.map((x) => (x.id === l.id ? { ...x, has: !x.has } : x)));
    const res = l.has
      ? await db.from("list_items").delete().eq("list_id", l.id).eq("cover_id", coverId)
      : await db.from("list_items").insert({ list_id: l.id, cover_id: coverId });
    if (res.error) {
      setError("That change didn't save. Try again.");
      load();
      return;
    }
    await db.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", l.id);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getBrowserClient();
    const name = title.trim();
    if (!db || !userId || !name) return;
    setBusy(true);
    const { data, error } = await db.from("lists").insert({ user_id: userId, title: name.slice(0, 80) }).select("id").single();
    if (!error && data) await db.from("list_items").insert({ list_id: data.id, cover_id: coverId });
    setBusy(false);
    if (error) {
      setError("The list wasn't created. Try again.");
      return;
    }
    setTitle("");
    load();
  };

  if (userId === undefined) return null;
  if (userId === null) {
    return (
      <Link className="save" href={`/login?next=/covers/${slug}`}>
        <ListIcon />
        Add to list
      </Link>
    );
  }

  return (
    <>
      <button type="button" className="save" onClick={openDialog}>
        <ListIcon />
        Add to list
      </button>
      <dialog
        ref={dialog}
        className="sheet list-sheet"
        aria-labelledby="lists-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="sheet-inner">
          <div className="sheet-head">
            <h2 id="lists-title">Add to a list</h2>
            <button type="button" className="text-button" onClick={() => dialog.current?.close()}>
              Done
            </button>
          </div>
          {lists.length > 0 ? (
            <ul className="list-choices">
              {lists.map((l) => (
                <li key={l.id}>
                  <label>
                    <input type="checkbox" checked={l.has} onChange={() => toggle(l)} />
                    <span>{l.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">You don't have any lists yet. Name your first one below.</p>
          )}
          <form onSubmit={create} className="list-new">
            <label className="visually-hidden" htmlFor="new-list">
              New list name
            </label>
            <input
              id="new-list"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New list, like Best 90s covers"
              maxLength={80}
            />
            <button className="button solid" type="submit" disabled={busy || !title.trim()}>
              Create
            </button>
          </form>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Link href="/me#lists" className="list-manage">
            Manage your lists
          </Link>
        </div>
      </dialog>
    </>
  );
}
