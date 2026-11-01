"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

/** Checks the session in the browser so every public page can stay static. */
export default function AccountLink() {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const db = getBrowserClient();
    if (!db) {
      setState("out");
      return;
    }
    db.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    const { data } = db.auth.onAuthStateChange((_e, session) => setState(session ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, []);

  if (state === "in") return <Link href="/me">Account</Link>;
  return (
    <Link href="/login" aria-busy={state === "loading"}>
      Sign in
    </Link>
  );
}
