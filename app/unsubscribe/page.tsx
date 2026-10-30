import type { Metadata } from "next";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const db = await getServerClient();
  let done = false;
  if (db && token && /^[0-9a-f-]{36}$/i.test(token)) {
    const { data } = await db.rpc("unsubscribe", { p_token: token });
    done = Boolean(data);
  }
  return (
    <section className="panel">
      <h1>{done ? "You're unsubscribed" : "Already unsubscribed"}</h1>
      <p>
        {done
          ? "You won't get the weekly email any more. You can join again from the bottom of any page."
          : "This link has already been used, or it's incomplete. You won't get any more emails from it."}
      </p>
      <p>
        <Link className="button solid" href="/">
          Back to the covers
        </Link>
      </p>
    </section>
  );
}
