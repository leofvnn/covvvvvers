export type Family = {
  slug: string;
  name: string;
  swatch: string;
};

/** The colour groups used for browsing, in the order they appear. */
export const FAMILIES: Family[] = [
  { slug: "black", name: "Black", swatch: "#111111" },
  { slug: "white", name: "White", swatch: "#f2f0ea" },
  { slug: "grey", name: "Grey", swatch: "#8a8a88" },
  { slug: "red", name: "Red", swatch: "#c62f2a" },
  { slug: "orange", name: "Orange", swatch: "#e2792b" },
  { slug: "yellow", name: "Yellow", swatch: "#e8c33a" },
  { slug: "brown", name: "Brown", swatch: "#7a5233" },
  { slug: "green", name: "Green", swatch: "#3f8a4a" },
  { slug: "blue", name: "Blue", swatch: "#2f5fb3" },
  { slug: "purple", name: "Purple", swatch: "#6c3fa0" },
  { slug: "pink", name: "Pink", swatch: "#e07aa6" },
];

export function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue *= 60;
  if (hue < 0) hue += 360;
  return { h: hue, s, l };
}

/** Puts a cover's main colour into one of the browsing groups. */
export function familyOf(hex: string | null | undefined): string | null {
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return null;
  const { h, s, l } = hexToHsl(hex);
  if (l < 0.13) return "black";
  if (l > 0.88 || (l > 0.8 && s < 0.6)) return "white";
  if (s < 0.22) return l < 0.3 ? "black" : l > 0.8 ? "white" : "grey";
  if ((h < 50 || h >= 345) && l < 0.36 && s < 0.5) return "brown";
  if (h >= 15 && h < 50 && (l < 0.42 || s < 0.42)) return "brown";
  if (h < 15 || h >= 345) return l > 0.62 ? "pink" : "red";
  if (h < 40) return "orange";
  if (h < 68) return l < 0.35 ? "brown" : "yellow";
  if (h < 170) return "green";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  return "pink";
}
