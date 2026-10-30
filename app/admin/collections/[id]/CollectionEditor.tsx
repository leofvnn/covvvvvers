"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { squareImage } from "@/lib/img";
import { saveCollection } from "../../actions";

type C = { id: string; title: string; artist: string; release_year: number; image_url: string };
type Props = {
  initial: { id: string; slug: string; title: string; description: string; sort_order: number; coverIds: string[] };
  covers: C[];
};

export default function CollectionEditor({ initial, covers }: Props) {
  const [f, setF] = useState(initial);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const byId = useMemo(() => new Map(covers.map((c) => [c.id, c])), [covers]);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return covers
      .filter((c) => !f.coverIds.includes(c.id))
      .filter((c) => c.title.toLowerCase().includes(s) || c.artist.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, covers, f.coverIds]);

  const move = (i: number, by: number) => {
    const ids = [...f.coverIds];
    const j = i + by;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setF({ ...f, coverIds: ids });
  };

  const save = async () => {
    setSaving(true);
    const res = await saveCollection(f);
    setSaving(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok && res.slug) setF((x) => ({ ...x, slug: res.slug! }));
  };

  return (
    <div className="stack">
      <label>
        <span>Name</span>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={100} />
      </label>
      <label>
        <span>Description</span>
        <textarea rows={3} value={f.description} maxLength={600} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </label>
      <label>
        <span>Position on the Collections page (1 shows first)</span>
        <input type="number" min={1} value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} />
      </label>

      <fieldset className="collection-edit">
        <legend>Covers ({f.coverIds.length})</legend>
        <label>
          <span className="visually-hidden">Find a cover to add</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a cover to add" />
        </label>
        {matches.length > 0 && (
          <ul className="admin-list pick">
            {matches.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setF({ ...f, coverIds: [...f.coverIds, c.id] })}>
                  <img src={squareImage(c.image_url, 96)} alt="" width={40} height={40} />
                  <span className="admin-list-text">
                    <strong>{c.title}</strong>
                    <span>
                      {c.artist}, {c.release_year}
                    </span>
                  </span>
                  <span className="badge">Add</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <ol className="admin-list ordered">
          {f.coverIds.map((id, i) => {
            const c = byId.get(id);
            if (!c) return null;
            return (
              <li key={id}>
                <img src={squareImage(c.image_url, 96)} alt="" width={40} height={40} />
                <span className="admin-list-text">
                  <strong>{c.title}</strong>
                  <span>
                    {c.artist}, {c.release_year}
                  </span>
                </span>
                <span className="order-tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.title} up`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === f.coverIds.length - 1}
                    aria-label={`Move ${c.title} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setF({ ...f, coverIds: f.coverIds.filter((x) => x !== id) })}
                  >
                    Remove
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      </fieldset>

      <div className="editor-bar">
        <button type="button" className="button solid" onClick={save} disabled={saving}>
          {saving ? "Saving" : "Save collection"}
        </button>
        <Link href={`/collections/${f.slug}`} target="_blank">
          View the live page
        </Link>
        {msg && (
          <p className={msg.ok ? "editor-ok" : "form-error"} role={msg.ok ? "status" : "alert"}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
