"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { supabaseEnabled } from "@/lib/supabase/config";

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "true";

function safeNext(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/me";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [next, setNext] = useState("/me");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setNext(safeNext(p.get("next")));
    if (p.get("error")) setError("That sign-in link has expired or was already used. Send yourself a new one.");
  }, []);

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const db = getBrowserClient();
    if (!db) return;
    setStatus("sending");
    setError("");
    const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setStatus("idle");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  async function google() {
    const db = getBrowserClient();
    if (!db) return;
    const { error } = await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setError(error.message);
  }

  if (!supabaseEnabled) {
    return (
      <section className="panel">
        <h1>Sign in</h1>
        <p>Accounts switch on once the site is connected to Supabase.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Sign in</h1>
      <p>Save the covers you love and suggest albums for the collection. No password needed.</p>

      {status === "sent" ? (
        <p className="notice" role="status">
          Check {email} for a sign-in link. It works once and expires in an hour.
        </p>
      ) : (
        <form onSubmit={sendLink} className="stack">
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="button solid" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending link" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      {googleEnabled && status !== "sent" && (
        <button className="button" type="button" onClick={google}>
          Continue with Google
        </button>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
