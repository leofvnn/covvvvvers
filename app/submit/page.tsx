import type { Metadata } from "next";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Submit a cover",
  description: "Suggest a rap album cover for the collection.",
};

export default async function SubmitPage() {
  const db = await getServerClient();
  const user = db ? (await db.auth.getUser()).data.user : null;

  return (
    <section className="panel">
      <h1>Submit a cover</h1>
      <p>
        Know a rap cover with a story behind it? Tell us the album. Every submission is reviewed, researched and
        written up before it joins the collection.
      </p>
      {!db ? (
        <p className="notice">Submissions open once the site is connected to Supabase.</p>
      ) : user ? (
        <SubmitForm />
      ) : (
        <p>
          <Link className="button solid" href="/login?next=/submit">
            Sign in to submit a cover
          </Link>
        </p>
      )}
    </section>
  );
}
