"use client";

/**
 * The thin bar along the top of the screen that shows a page is on its way.
 * startProgress() runs on every click that leads to another page; doneProgress() runs once
 * the new page is on screen. The bar lives in <NavTransitions>, which is on every page.
 */

let timer = 0;
let safety = 0;

const bar = () => document.getElementById("nav-progress");

export function startProgress() {
  const el = bar();
  if (!el) return;
  window.clearTimeout(timer);
  window.clearTimeout(safety);
  document.documentElement.dataset.loading = "true";
  el.classList.remove("is-done");
  // Restart the creep from zero even if a previous load just finished.
  el.classList.remove("is-loading");
  void el.offsetWidth;
  el.classList.add("is-loading");
  // Never leave it running if something goes wrong.
  safety = window.setTimeout(doneProgress, 15000);
}

export function doneProgress() {
  const el = bar();
  delete document.documentElement.dataset.loading;
  document.querySelectorAll(".is-pressed").forEach((n) => n.classList.remove("is-pressed"));
  window.clearTimeout(safety);
  if (!el || !el.classList.contains("is-loading")) return;
  el.classList.add("is-done");
  timer = window.setTimeout(() => el.classList.remove("is-loading", "is-done"), 400);
}

/** Marks what was clicked, so it responds straight away while the next page loads. */
export function markPressed(el: Element | null | undefined) {
  el?.classList.add("is-pressed");
}
