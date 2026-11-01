"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type Choice = { id: string; title: string; artist: string; image: string };

/** One settings block: a heading, a line of explanation, then the controls. */
function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="settings-block">
      <div>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
      <div className="settings-controls">{children}</div>
    </section>
  );
}

function Status({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={msg.ok ? "form-ok" : "form-error"} role={msg.ok ? "status" : "alert"}>
      {msg.text}
    </p>
  );
}

export default function AccountSettings({
  userId,
  email,
  name: initialName,
  avatar: initialAvatar,
  choices,
  isAdmin,
}: {
  userId: string;
  email: string;
  name: string;
  avatar: string | null;
  choices: Choice[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const db = getBrowserClient();
  const [busy, setBusy] = useState("");

  // Profile
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setBusy("profile");
    setProfileMsg(null);
    const { error } = await db
      .from("profiles")
      .update({ display_name: name.trim().slice(0, 60) || null, avatar_cover_id: avatar })
      .eq("id", userId);
    setBusy("");
    if (error) return setProfileMsg({ ok: false, text: "Your profile didn't save. Try again." });
    setProfileMsg({ ok: true, text: "Saved." });
    window.dispatchEvent(new Event("profilechange"));
    router.refresh();
  };

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newEmail.trim()) return;
    setBusy("email");
    setEmailMsg(null);
    const { error } = await db.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/me/settings` },
    );
    setBusy("");
    if (error) return setEmailMsg({ ok: false, text: error.message });
    setEmailMsg({ ok: true, text: `Check ${newEmail.trim()} (and ${email}) for a link to confirm the change.` });
    setNewEmail("");
  };

  // Newsletter
  const [news, setNews] = useState<boolean | null>(null);
  const [newsMsg, setNewsMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    db?.rpc("my_newsletter").then(({ data, error }) => setNews(error ? null : Boolean(data)));
  }, [db]);
  const toggleNews = async () => {
    if (!db || news === null) return;
    setBusy("news");
    setNewsMsg(null);
    const { error } = await db.rpc("set_my_newsletter", { p_on: !news });
    setBusy("");
    if (error) return setNewsMsg({ ok: false, text: "That didn't change. Try again." });
    setNews(!news);
  };

  // Export
  const exportData = async () => {
    if (!db) return;
    setBusy("export");
    const [profile, favs, lists, subs] = await Promise.all([
      db.from("profiles").select("display_name, created_at").eq("id", userId).maybeSingle(),
      db.from("favorites").select("created_at, covers(title, artist, slug)").eq("user_id", userId),
      db.from("lists").select("title, description, created_at, list_items(added_at, covers(title, artist, slug))").eq("user_id", userId),
      db.from("submissions").select("*").eq("user_id", userId),
    ]);
    const data = {
      exported_at: new Date().toISOString(),
      email,
      profile: profile.data,
      saved: favs.data,
      lists: lists.data,
      submissions: subs.data,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "covvvvvers-account.json";
    a.click();
    URL.revokeObjectURL(url);
    setBusy("");
  };

  // Delete
  const [confirm, setConfirm] = useState("");
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || confirm !== "DELETE") return;
    setBusy("delete");
    const { error } = await db.rpc("delete_my_account");
    if (error) {
      setBusy("");
      return setDeleteMsg({ ok: false, text: "Your account wasn't deleted. Try again, or send feedback and we'll do it for you." });
    }
    await db.auth.signOut();
    window.location.assign("/");
  };

  return (
    <div className="account-section settings">
      <Block title="Profile" note="Your name and picture show on your account. Pick the picture from your saved covers.">
        <form onSubmit={saveProfile} className="stack">
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="What should we call you?" autoComplete="nickname" />
          </label>
          <fieldset className="avatar-choices">
            <legend>Picture</legend>
            {choices.length ? (
              <div>
                <label className="avatar-none">
                  <input type="radio" name="avatar" checked={avatar === null} onChange={() => setAvatar(null)} />
                  <span>{(name || email || "?")[0].toUpperCase()}</span>
                </label>
                {choices.map((c) => (
                  <label key={c.id} title={`${c.title}, ${c.artist}`}>
                    <input type="radio" name="avatar" checked={avatar === c.id} onChange={() => setAvatar(c.id)} />
                    <img src={c.image} alt={`${c.title} by ${c.artist}`} width={56} height={56} loading="lazy" />
                  </label>
                ))}
              </div>
            ) : (
              <p className="empty-inline">Bookmark a cover and it can be your picture.</p>
            )}
          </fieldset>
          <div>
            <button className="button solid" type="submit" disabled={!!busy} aria-busy={busy === "profile"}>
              Save profile
            </button>
          </div>
          <Status msg={profileMsg} />
        </form>
      </Block>

      <Block title="Email" note={`You sign in with ${email}. Changing it sends a confirmation link to the new address.`}>
        <form onSubmit={changeEmail} className="stack">
          <label>
            <span>New email</span>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoComplete="email" required />
          </label>
          <div>
            <button className="button" type="submit" disabled={!!busy || !newEmail.trim()} aria-busy={busy === "email"}>
              Change email
            </button>
          </div>
          <Status msg={emailMsg} />
        </form>
      </Block>

      <Block title="Newsletter" note="New covers and the stories behind them, now and then. Unsubscribe any time.">
        {news === null ? (
          <p className="empty-inline">Newsletter settings aren't available right now.</p>
        ) : (
          <div className="toggle-row">
            <button
              type="button"
              role="switch"
              aria-checked={news}
              className="switch"
              onClick={toggleNews}
              disabled={!!busy}
              aria-busy={busy === "news"}
            >
              <span />
            </button>
            <span>{news ? "You're subscribed" : "Not subscribed"}</span>
          </div>
        )}
        <Status msg={newsMsg} />
      </Block>

      <Block title="Your data" note="Download everything in your account: profile, bookmarks, lists and submissions.">
        <div>
          <button className="button" type="button" onClick={exportData} disabled={!!busy} aria-busy={busy === "export"}>
            Download my data
          </button>
        </div>
      </Block>

      <Block title="Sign out">
        <form action="/auth/signout" method="post">
          <button className="button" type="submit">
            Sign out
          </button>
        </form>
      </Block>

      {!isAdmin && (
        <Block title="Delete account" note="Deletes your account, bookmarks, lists and submissions for good. This can't be undone.">
          <form onSubmit={deleteAccount} className="stack">
            <label>
              <span>Type DELETE to confirm</span>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
            </label>
            <div>
              <button className="button danger" type="submit" disabled={!!busy || confirm !== "DELETE"} aria-busy={busy === "delete"}>
                Delete my account
              </button>
            </div>
            <Status msg={deleteMsg} />
          </form>
        </Block>
      )}
    </div>
  );
}
