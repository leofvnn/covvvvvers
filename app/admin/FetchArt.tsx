"use client";

import { useRef, useState } from "react";

type Result = { done: string[]; failed: string[]; remaining: number; error?: string };

export default function FetchArt({ remaining: initial }: { remaining: number }) {
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(false);
  const [moved, setMoved] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [error, setError] = useState("");
  const stop = useRef(false);

  async function run() {
    setRunning(true);
    setError("");
    setFailed([]);
    stop.current = false;
    let left = remaining;
    let stuck = 0;
    while (left > 0 && !stop.current) {
      const res = await fetch("/api/admin/fetch-art", { method: "POST" });
      const data: Result = await res.json().catch(() => ({ done: [], failed: [], remaining: left, error: "No response" }));
      if (!res.ok || data.error) {
        setError(data.error ?? `The server returned ${res.status}.`);
        break;
      }
      setMoved((m) => m + data.done.length);
      if (data.failed.length) setFailed((f) => [...f, ...data.failed]);
      // Stop if a whole batch failed twice in a row, so a broken image can't loop forever.
      stuck = data.done.length === 0 && data.failed.length === 0 ? stuck + 1 : 0;
      left = data.remaining;
      setRemaining(left);
      if (stuck >= 2) {
        setError("Something went wrong. Try again in a minute.");
        break;
      }
    }
    setRunning(false);
  }

  if (remaining === 0 && !running) {
    return (
      <p className="notice" role="status">
        Every cover has an image{moved ? `. Added ${moved} just now.` : "."}
      </p>
    );
  }

  return (
    <div className="stack">
      <p>
        {remaining} {remaining === 1 ? "cover has" : "covers have"} no image yet. Fetching finds each album on MusicBrainz,
        copies its front cover from the Cover Art Archive into your Supabase storage and sets its colours. They go live as
        soon as they have an image. Keep this page open until it finishes.
      </p>
      <div className="intro-actions">
        <button className="button solid" type="button" onClick={run} disabled={running} aria-busy={running}>
          {running ? `Fetching covers, ${remaining} left` : "Fetch cover art"}
        </button>
        {running && (
          <button className="button" type="button" onClick={() => (stop.current = true)}>
            Stop after this batch
          </button>
        )}
      </div>
      {moved > 0 && <p role="status">Added {moved} so far.</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {failed.length > 0 && (
        <p>These need an image uploaded by hand in the cover editor:</p>
      )}
      {failed.length > 0 && (
        <ul className="sub-list">
          {failed.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
