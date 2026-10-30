"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The cover on its page. On desktop it tilts toward the pointer with a soft light,
 * like holding a sleeve. Clicking it opens a full-screen view you can zoom and pan.
 */
export default function CoverArt({ src, zoomSrc, alt, width, height }: {
  src: string;
  zoomSrc: string;
  alt: string;
  width: number;
  height: number;
}) {
  const frame = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = frame.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--lx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${((y + 0.5) * 100).toFixed(1)}%`);
    el.dataset.tilt = "on";
  };
  const onLeave = () => {
    const el = frame.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilt;
  };

  return (
    <>
      <button
        ref={frame}
        type="button"
        className="art-frame"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => setOpen(true)}
        aria-label={`Zoom into the cover of ${alt}`}
      >
        <img src={src} alt={alt} width={width} height={height} style={{ viewTransitionName: "cover-art" }} fetchPriority="high" />
        <span className="art-light" aria-hidden="true" />
        <span className="art-zoom-hint" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4M11 8v6M8 11h6" />
          </svg>
        </span>
      </button>
      {open && <Lightbox src={zoomSrc} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
    document.documentElement.classList.add("menu-open");
    return () => document.documentElement.classList.remove("menu-open");
  }, []);

  const clamp = (s: number) => Math.min(6, Math.max(1, s));
  const zoomTo = (scale: number) => setView((v) => (clamp(scale) === 1 ? { scale: 1, x: 0, y: 0 } : { ...v, scale: clamp(scale) }));

  return (
    <dialog ref={dialog} className="lightbox" onClose={onClose} onCancel={onClose} aria-label={`${alt}, full screen`}>
      <div
        className="lightbox-stage"
        onWheel={(e) => zoomTo(view.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15))}
        onDoubleClick={() => zoomTo(view.scale > 1 ? 1 : 2.5)}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
            pan.current = null;
          } else {
            pan.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
          }
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pinch.current && pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            zoomTo((pinch.current.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist);
          } else if (pan.current && view.scale > 1) {
            const p = pan.current;
            setView((v) => ({ ...v, x: p.vx + (e.clientX - p.x), y: p.vy + (e.clientY - p.y) }));
          }
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          if (pointers.current.size === 0) pan.current = null;
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        />
      </div>
      <div className="lightbox-bar">
        <button type="button" onClick={() => zoomTo(view.scale / 1.5)} aria-label="Zoom out" disabled={view.scale <= 1}>
          −
        </button>
        <span aria-live="polite">{Math.round(view.scale * 100)}%</span>
        <button type="button" onClick={() => zoomTo(view.scale * 1.5)} aria-label="Zoom in" disabled={view.scale >= 6}>
          +
        </button>
        <button type="button" className="lightbox-close" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
