"use client";

import { useEffect, useRef } from "react";
import type { Person } from "@/lib/people";

export default function PersonModal({
  person,
  era,
  position,
  onPrev,
  onNext,
  onClose,
}: {
  person: Person & { id: string };
  era: { title: string; span: string; bg: string; ink: string };
  position: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

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

  // Back to the top when moving to the next person.
  useEffect(() => {
    if (dialog.current) dialog.current.scrollTop = 0;
  }, [person.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

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
