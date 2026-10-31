"use client";

import { useActionState } from "react";
import { subscribe, type NewsletterState } from "@/app/newsletter/actions";

const initial: NewsletterState = { ok: false, message: "" };

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initial);
  return (
    <form action={action} className="newsletter">
      <label htmlFor="nl-email" className="newsletter-label">
        Cover of the week, every Monday by email
      </label>
      {state.ok ? (
        <p role="status">{state.message}</p>
      ) : (
        <div className="newsletter-row">
          <input id="nl-email" name="email" type="email" required placeholder="Your email" autoComplete="email" />
          <button className="button solid" type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Joining" : "Join"}
          </button>
        </div>
      )}
      {!state.ok && state.message && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
