"use client";

import { useEffect, useRef, useState } from "react";
import type { Person } from "@/lib/people";
import type { PersonPhoto } from "@/lib/images";

type Summary = { image: string | null; url: string; description: string | null };
const cache = new Map<string, Promise<Summary>>();

/** Loads the photo and link for a person from Wikipedia's public summary API. */
function summary(wiki: string): Promise<Summary> {
  let p = cache.get(wiki);
  if (!p) {
    p = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => ({
        image: d.thumbnail?.source ? String(d.thumbnail.source).replace(/\/\d+px-/, "/640px-") : (d.originalimage?.source ?? null),
        url: d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${wiki}`,
        description: d.description ?? null,
      }))
      .catch(() => ({ image: null, url: `https://en.wikipedia.org/wiki/${wiki}`, description: null }));
    cache.set(wiki, p);
  }
  return p;
}

const initials = (name: string) =>
  name
    .replace(/^The /, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function PersonModal({
  person,
  era,
  position,
  onPrev,
  onNext,
  onClose,
}: {
  person: Person & { id: string; photo?: PersonPhoto | null };
  era: { title: string; span: string; bg: string; ink: string };
  position: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [info, setInfo] = useState<Summary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) {
      d.showModal();
      d.focus();
      d.scrollTop = 0;
    }
    document.documentElement.classList.add("menu-open");
    return () => document.documentElement.classList.remove("menu-open");
  }, []);

  useEffect(() => {
    if (dialog.current) dialog.current.scrollTop = 0;
    let live = true;
    setInfo(null);
    setLoaded(false);
    setBroken(false);
    summary(person.wiki).then((s) => live && setInfo(s));
    return () => {
      live = false;
    };
  }, [person.wiki]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  // The photo found for this person, else the one on their Wikipedia article. Photo credits
  // are listed in the page's Sources.
  const found = person.photo ?? null;
  const photo = broken ? null : (found?.src ?? info?.image ?? null);

  return (
    <dialog
      ref={dialog}
      className="person-modal"
      tabIndex={-1}
      aria-labelledby="person-name"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      style={{ "--era-bg": era.bg, "--era-ink": era.ink } as React.CSSProperties}
    >
      <div className="person-inner" key={person.id}>
        <div className="person-photo">
          <span className="person-monogram" aria-hidden="true">
            {initials(person.name)}
          </span>
          {photo && (
            <img
              src={photo}
              alt={`${person.name}`}
              className={loaded ? "is-loaded" : undefined}
              onLoad={() => setLoaded(true)}
              onError={() => setBroken(true)}
            />
          )}
        </div>
        <div className="person-body">
          <p className="person-era">
            {era.title} · {era.span}
          </p>
          <h2 id="person-name">{person.name}</h2>
          <p className="person-role">
            {person.role} · {person.from}
          </p>
          <p className="person-text">{person.text}</p>
          <div className="person-works">
            <span>Known for</span>
            <ul>
              {person.works.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="person-nav">
        <button type="button" onClick={onPrev} aria-label="Previous contributor">
          ←
        </button>
        <span>{position}</span>
        <button type="button" onClick={onNext} aria-label="Next contributor">
          →
        </button>
        <button type="button" className="person-close" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
