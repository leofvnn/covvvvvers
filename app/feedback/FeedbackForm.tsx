"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { sendFeedback, type FeedbackState } from "./actions";

const initial: FeedbackState = { ok: false, message: "" };

export default function FeedbackForm() {
  const [state, action, pending] = useActionState(sendFeedback, initial);
  const [signedIn, setSignedIn] = useState(false);
  const [from, setFrom] = useState("");
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setFrom(new URLSearchParams(window.location.search).get("from") ?? document.referrer.replace(window.location.origin, ""));
    getBrowserClient()
      ?.auth.getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="stack">
      <label>
        <span>What is it about?</span>
        <select name="topic" defaultValue="general">
          <option value="general">General feedback</option>
          <option value="idea">An idea for the site</option>
          <option value="problem">Something isn't working</option>
          <option value="correction">A correction to a cover or credit</option>
        </select>
      </label>
      <label>
        <span>Your message</span>
        <textarea name="message" rows={7} required maxLength={3000} />
      </label>
      {!signedIn && (
        <label>
          <span>Your email, if you'd like a reply</span>
          <input name="email" type="email" autoComplete="email" maxLength={200} />
        </label>
      )}
      <input type="hidden" name="page" value={from} />
      <div className="visually-hidden" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button solid" type="submit" disabled={pending}>
        {pending ? "Sending" : "Send feedback"}
      </button>
      {state.message && (
        <p className={state.ok ? "notice" : "form-error"} role={state.ok ? "status" : "alert"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
