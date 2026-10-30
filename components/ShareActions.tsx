"use client";

import { useState } from "react";

/** Share the cover page. */
export default function ShareActions({ title, artist, slug }: { title: string; artist: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    const data = { title: `${title} by ${artist}`, text: `The story behind the cover of ${title}`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // Closed the share sheet; nothing to do.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="share-actions">
      <button type="button" className="text-button" onClick={share}>
        {copied ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
