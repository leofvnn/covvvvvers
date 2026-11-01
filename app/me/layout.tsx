import type { Metadata } from "next";
import Link from "next/link";
import AccountTabs from "@/components/AccountTabs";
import { getAccount } from "@/lib/account";
import { getCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { db, user, profile } = await getAccount();
  const [favs, lists, subs, covers] = await Promise.all([
    db.from("favorites").select("cover_id", { count: "exact", head: true }).eq("user_id", user.id),
    db.from("lists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    db.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    getCovers(),
  ]);
  const avatar = profile.avatar_cover_id ? covers.find((c) => c.id === profile.avatar_cover_id) : null;
  const name = profile.display_name?.trim();

  return (
    <>
      <header className="page-head account-head">
        <div className="account-who">
          {avatar ? (
            <img className="account-avatar" src={squareImage(avatar.image_url, 240)} alt="" width={64} height={64} />
          ) : (
            <span className="account-avatar is-empty" aria-hidden="true">
              {(name || user.email || "?")[0].toUpperCase()}
            </span>
          )}
          <div>
            <h1>Account</h1>
            <p>
              {name ? `${name} · ` : ""}
              {user.email}
            </p>
          </div>
        </div>
        <div className="intro-actions">
          {profile.is_admin && (
            <Link className="button solid" href="/admin">
              Admin
            </Link>
          )}
          <Link className="button" href="/submit">
            Submit a cover
          </Link>
        </div>
      </header>
      <AccountTabs counts={{ saved: favs.count ?? 0, lists: lists.count ?? 0, submissions: subs.count ?? 0 }} />
      {children}
    </>
  );
}
