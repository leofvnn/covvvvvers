"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  isPublic: boolean;
};

export default function ProfileSettings(p: Props) {
  const router = useRouter();
  const [f, setF] = useState({ displayName: p.displayName, username: p.username, bio: p.bio, isPublic: p.isPublic });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = f.username.trim().toLowerCase();
    if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
      setMsg({ ok: false, text: "Usernames use 3 to 24 lowercase letters, numbers or underscores." });
      return;
    }
    if (f.isPublic && !username) {
      setMsg({ ok: false, text: "Choose a username to make your profile public." });
      return;
    }
    const db = getBrowserClient();
    if (!db) return;
    setBusy(true);
    const { error } = await db
      .from("profiles")
      .update({
        display_name: f.displayName.trim().slice(0, 60) || null,
        username: username || null,
        bio: f.bio.trim().slice(0, 280) || null,
        is_public: f.isPublic,
      })
      .eq("id", p.userId);
    setBusy(false);
    if (error) {
      const taken = error.code === "23505";
      setMsg({ ok: false, text: taken ? "That username is taken. Try another." : "Your profile didn't save. Try again." });
      return;
    }
    setMsg({ ok: true, text: "Profile saved." });
    router.refresh();
  };

  return (
    <form className="stack settings" onSubmit={save}>
      <label>
        <span>Name</span>
        <input value={f.displayName} maxLength={60} onChange={(e) => setF({ ...f, displayName: e.target.value })} />
      </label>
      <label>
        <span>Username</span>
        <input
          value={f.username}
          maxLength={24}
          placeholder="for your public page, like covers_fan"
          onChange={(e) => setF({ ...f, username: e.target.value })}
        />
      </label>
      <label>
        <span>About you</span>
        <textarea rows={3} maxLength={280} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
      </label>
      <label className="check">
        <input type="checkbox" checked={f.isPublic} onChange={(e) => setF({ ...f, isPublic: e.target.checked })} />
        <span>Show my saved covers and public lists on a profile page</span>
      </label>
      <button className="button solid" type="submit" disabled={busy}>
        {busy ? "Saving" : "Save profile"}
      </button>
      {msg && (
        <p className={msg.ok ? "notice" : "form-error"} role={msg.ok ? "status" : "alert"}>
          {msg.text}{" "}
          {msg.ok && p.isPublic && f.username && <Link href={`/u/${f.username.toLowerCase()}`}>View your profile</Link>}
        </p>
      )}
    </form>
  );
}
