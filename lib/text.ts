/** Plain text of an essay stored as <p> paragraphs. */
export function plainText(html: string | null | undefined) {
  return (html ?? "")
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function readingMinutes(html: string | null | undefined) {
  const words = plainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** The opening of an essay: whole sentences, at least about 120 characters. */
export function firstSentence(html: string | null, max = 240) {
  const text = plainText((html ?? "").replace(/<\/p>[\s\S]*$/, ""));
  const sentences = text.match(/[^.!?]+[.!?]+["')]*(\s+|$)/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if (out.length >= 120 || (out && (out + s).length > max)) break;
    out += s;
  }
  out = out.trim() || text;
  return out.length > max ? out.slice(0, max).replace(/\s\S*$/, "") + "..." : out;
}

/**
 * A line worth setting large: the longest quotation in the essay that reads as speech,
 * between 40 and 180 characters. Returns null when the essay has none.
 */
export function pickPullQuote(html: string | null | undefined) {
  const text = plainText(html);
  const quotes = [...text.matchAll(/"([^"]{40,180})"/g)].map((m) => m[1].trim());
  const spoken = quotes.filter((q) => q.split(/\s+/).length >= 8 && /[a-z]/.test(q));
  if (!spoken.length) return null;
  return spoken.sort((a, b) => b.length - a.length)[0];
}

/** Turns plain paragraphs separated by blank lines into the <p> markup the site stores. */
export function paragraphsToHtml(text: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

export function slugify(s: string) {
  return (
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "item"
  );
}

export function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}
