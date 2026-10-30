/**
 * Cover art is served from the Wix media CDN, which resizes on the fly.
 * Any other image address is used as it is.
 */
export function squareImage(url: string, size: number) {
  if (url.includes("static.wixstatic.com/media/")) {
    return `${url}/v1/fill/w_${size},h_${size},al_c,q_85,enc_auto/cover.jpg`;
  }
  return url;
}

export function fullImage(url: string, size: number) {
  if (url.includes("static.wixstatic.com/media/")) {
    return `${url}/v1/fit/w_${size},h_${size},q_90,enc_auto/cover.jpg`;
  }
  return url;
}

export function squareSrcSet(url: string, sizes: number[]) {
  if (!url.includes("static.wixstatic.com/media/")) return undefined;
  return sizes.map((s) => `${squareImage(url, s)} ${s}w`).join(", ");
}

/** Picks black or white text for a background colour. */
export function inkFor(hex: string | null | undefined) {
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return "#000000";
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.22 ? "#000000" : "#FFFFFF";
}
