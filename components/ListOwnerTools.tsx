"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { startProgress } from "@/lib/progress";
import { getBrowserClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  covers: { id: string; title: string }[];
};

/** Edit, share, reorder out or delete your own list. */
export default function ListOwnerTools({ id, title, description, isPublic, covers }: Props) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ title, description, isPublic });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "delete">("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getBrowserClient();
    if (!db) return;
    setBusy("save");
    const { error } = await db
      .from("lists")
      .update({
        title: form.title.trim().slice(0, 80) || "Untitled list",
        description: form.description.trim().slice(0, 500) || null,
        is_public: form.isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      setError("The changes didn't save. Try again.");
      setBusy("");
      return;
    }
    setBusy("");
    dialog.current?.close();
    router.refresh();
  };

  const remove = async (coverId: string) => {
    const db = getBrowserClient();
    if (!db) return;
    await db.from("list_items").delete().eq("list_id", id).eq("cover_id", coverId);
    router.refresh();
  };

  const destroy = async () => {
    const db = getBrowserClient();
    if (!db) return;
    setBusy("delete");
    const { error } = await db.from("lists").delete().eq("id", id);
    if (error) {
      setError("The list wasn't deleted. Try again.");
      setBusy("");
      return;
    }
    startProgress();
    router.push("/me/lists");
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="intro-actions">
      <button type="button" className="button" onClick={() => dialog.current?.showModal()}>
        Edit list
      </button>
      {isPublic && (
        <button type="button" className="button" onClick={share}>
          {copied ? "Link copied" : "Copy link"}
        </button>
      )}
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="edit-list-h"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <form className="sheet-inner stack" onSubmit={save}>
          <div className="sheet-head">
            <h2 id="edit-list-h">Edit list</h2>
            <button type="button" className="text-button" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
          </div>
          <label>
            <span>Name</span>
            <input value={form.title} maxLength={80} required onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="check">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            <span>Anyone with the link can see this list</span>
          </label>
          {covers.length > 0 && (
            <fieldset className="list-remove">
              <legend>Covers in this list</legend>
              <ul>
                {covers.map((c) => (
                  <li key={c.id}>
                    <span>{c.title}</span>
                    <button type="button" className="text-button" onClick={() => remove(c.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
          <button className="button solid" type="submit" disabled={!!busy} aria-busy={busy === "save"}>
            Save changes
          </button>
          {confirmDelete ? (
            <p className="danger-row">
              Delete this list for good?{" "}
              <button type="button" className="text-button danger" onClick={destroy} disabled={!!busy} aria-busy={busy === "delete"}>
                Delete list
              </button>{" "}
              <button type="button" className="text-button" onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </p>
          ) : (
            <button type="button" className="text-button danger" onClick={() => setConfirmDelete(true)}>
              Delete this list
            </button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </dialog>
    </div>
  );
}
