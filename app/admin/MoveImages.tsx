"use client";

import { useRef, useState } from "react";

type Result = { moved: string[]; failed: string[]; remaining: number; error?: string };

export default function MoveImages({ remaining: initial }: { remaining: number }) {
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
      const res = await fetch("/api/admin/move-images", { method: "POST" });
      const data: Result = await res.json().catch(() => ({ moved: [], failed: [], remaining: left, error: "No response" }));
      if (!res.ok || data.error) {
        setError(data.error ?? `The server returned ${res.status}.`);
        break;
      }
      setMoved((m) => m + data.moved.length);
      if (data.failed.length) setFailed((f) => [...f, ...data.failed]);
      // Stop if a whole batch failed twice in a row, so a broken image can't loop forever.
      stuck = data.moved.length === 0 ? stuck + 1 : 0;
      left = data.remaining;
      setRemaining(left);
      if (stuck >= 2) {
        setError("Some images couldn't be moved. The list below says which.");
        break;
      }
    }
    setRunning(false);
  }

  if (remaining === 0 && !running) {
    return (
      <p className="notice" role="status">
        All cover images are stored in Supabase{moved ? `. Moved ${moved} just now.` : "."}
      </p>
    );
  }

  return (
    <div className="stack">
      <p>
        {remaining} {remaining === 1 ? "image is" : "images are"} still loaded from Wix. Moving them copies each cover
        into your Supabase storage and points the site at the copy. Keep this page open until it finishes.
      </p>
      <div className="intro-actions">
        <button className="button solid" type="button" onClick={run} disabled={running}>
          {running ? `Moving images, ${remaining} left` : "Move images to Supabase"}
        </button>
        {running && (
          <button className="button" type="button" onClick={() => (stop.current = true)}>
            Stop after this batch
          </button>
        )}
      </div>
      {moved > 0 && <p role="status">Moved {moved} so far.</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
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
