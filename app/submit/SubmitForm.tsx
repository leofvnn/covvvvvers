"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { submitCover, type SubmitState } from "./actions";

const initial: SubmitState = { ok: false, message: "" };

export default function SubmitForm() {
  const [state, action, pending] = useActionState(submitCover, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="stack">
      <label>
        <span>Album title</span>
        <input name="album_title" required maxLength={200} />
      </label>
      <label>
        <span>Artist</span>
        <input name="artist" required maxLength={200} />
      </label>
      <label>
        <span>Release year</span>
        <input name="release_year" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} />
      </label>
      <label>
        <span>Link to the album</span>
        <input name="link" type="url" placeholder="Spotify, Apple Music or Bandcamp" maxLength={500} />
      </label>
      <label>
        <span>Who made the cover, if you know</span>
        <input name="cover_credit" maxLength={300} />
      </label>
      <label>
        <span>Why it belongs here</span>
        <textarea name="note" rows={5} maxLength={2000} />
      </label>
      <button className="button solid" type="submit" disabled={pending}>
        {pending ? "Sending" : "Send for review"}
      </button>
      {state.message && (
        <p className={state.ok ? "notice" : "form-error"} role={state.ok ? "status" : "alert"}>
          {state.message} {state.ok && <Link href="/me">Account</Link>}
        </p>
      )}
    </form>
  );
}
