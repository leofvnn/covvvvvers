import type { Metadata } from "next";
import Link from "next/link";
import AccountTabs from "@/components/AccountTabs";
import { getAccount } from "@/lib/account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { db, user, profile } = await getAccount();
  const [lists, subs] = await Promise.all([
    db.from("lists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    db.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const name = profile.display_name?.trim();

  return (
    <>
      <header className="page-head">
        <h1>Account</h1>
        <p>
          {name ? `${name} · ` : ""}
          {user.email}
        </p>
        {profile.is_admin && (
          <div className="intro-actions">
            <Link className="button solid" href="/admin">
              Admin
            </Link>
          </div>
        )}
      </header>
      {/* Lists counts Bookmarked, the default list, too. */}
      <AccountTabs counts={{ lists: (lists.count ?? 0) + 1, submissions: subs.count ?? 0 }} />
      {children}
    </>
  );
}
