"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
const OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  // Every toggle on the page (menu and footer) stays in step.
  useEffect(() => {
    const read = () => {
      try {
        const t = localStorage.getItem("theme");
        setTheme(t === "light" || t === "dark" ? t : "system");
      } catch {}
    };
    read();
    window.addEventListener("themechange", read);
    return () => window.removeEventListener("themechange", read);
  }, []);

  const choose = (t: Theme) => {
    setTheme(t);
    try {
      if (t === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", t);
    } catch {}
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={theme === o.value}
          onClick={() => choose(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
