"use client";

import { useEffect, useState } from "react";

type Size = "large" | "small";

/** Larger or smaller album cards in every grid. Smaller fits more covers on screen. */
export default function GridToggle() {
  const [size, setSize] = useState<Size>("large");

  useEffect(() => {
    const read = () => {
      try {
        setSize(localStorage.getItem("grid") === "small" ? "small" : "large");
      } catch {}
    };
    read();
    window.addEventListener("gridchange", read);
    return () => window.removeEventListener("gridchange", read);
  }, []);

  const choose = (s: Size) => {
    setSize(s);
    try {
      if (s === "small") localStorage.setItem("grid", "small");
      else localStorage.removeItem("grid");
    } catch {}
    if (s === "small") document.documentElement.dataset.grid = "small";
    else delete document.documentElement.dataset.grid;
    window.dispatchEvent(new Event("gridchange"));
  };

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Grid size">
      {(["large", "small"] as Size[]).map((s) => (
        <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => choose(s)}>
          {s === "large" ? "Larger" : "Smaller"}
        </button>
      ))}
    </div>
  );
}
