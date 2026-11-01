"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { bookmark, createList, listName, unbookmark, useBookmarks, DEFAULT_LIST, type Where } from "@/lib/bookmarks";

export function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5h12v17l-6-4.2-6 4.2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The cover page's one save control. A tap bookmarks the cover in the default list, Saved;
 * "Change list" moves it to one of the member's own lists or a new one.
 */
export default function BookmarkButton({ coverId, slug }: { coverId: string; slug: string }) {
  const s = useBookmarks();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  if (!s.ready) return <span className="save-placeholder" />;
  if (!s.userId) {
    return (
      <Link className="save" href={`/login?next=/covers/${slug}`}>
        <BookmarkIcon filled={false} />
        Bookmark
      </Link>
    );
  }

  const where = s.where.get(coverId);
  const saved = where !== undefined;

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  const toggle = () =>
    run(async () => {
      if (saved) await unbookmark(coverId);
      else {
        navigator.vibrate?.(12);
        await bookmark(coverId, null);
      }
    });

  const move = (to: Where) => run(() => bookmark(coverId, to));

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    run(async () => {
      const list = await createList(title);
      await bookmark(coverId, list.id);
      setTitle("");
    });
  };

  return (
    <div className="bookmark">
      <button type="button" className="save" aria-pressed={saved} onClick={toggle} disabled={busy} aria-busy={busy}>
        <BookmarkIcon filled={saved} />
        {saved ? "Bookmarked" : "Bookmark"}
      </button>
      {saved && (
        <p className="bookmark-where">
          In <Link href={where ? `/lists/${where}` : "/me/saved"}>{listName(s, where)}</Link>.{" "}
          <button type="button" className="text-button" onClick={() => dialog.current?.showModal()}>
            Change list
          </button>
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <dialog
        ref={dialog}
        className="sheet list-sheet"
        aria-labelledby="move-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="sheet-inner">
          <div className="sheet-head">
            <h2 id="move-title">Bookmark in</h2>
            <button type="button" className="text-button" onClick={() => dialog.current?.close()}>
              Done
            </button>
          </div>
          <ul className="list-choices" role="radiogroup" aria-label="List">
            {[{ id: null as Where, title: DEFAULT_LIST }, ...s.lists].map((l) => (
              <li key={l.id ?? "saved"}>
                <label>
                  <input type="radio" name="bookmark-list" checked={where === l.id} disabled={busy} onChange={() => move(l.id)} />
                  <span>
                    {l.title}
                    {l.id === null && <small> (default)</small>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <form onSubmit={create} className="list-new">
            <label className="visually-hidden" htmlFor="new-list">
              New list name
            </label>
            <input id="new-list" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New list, like Best 90s covers" maxLength={80} />
            <button className="button solid" type="submit" disabled={busy || !title.trim()} aria-busy={busy}>
              Create
            </button>
          </form>
          <Link href="/me/lists" className="list-manage">
            Manage your lists
          </Link>
        </div>
      </dialog>
    </div>
  );
}
