/**
 * Cover art lives in the Supabase "covers" bucket as two files per cover:
 *   covers/<slug>.jpg      up to 2000px, for cover pages
 *   covers/<slug>-600.jpg  600px square, for the wall and lists
 * Covers not yet moved are still served from the Wix media CDN, which resizes on the fly.
 */
const WIX = "static.wixstatic.com/media/";
const BUCKET = "/storage/v1/object/public/covers/";

const isWix = (url: string) => url.includes(WIX);
const isBucket = (url: string) => url.includes(BUCKET) && /\.jpg(\?.*)?$/.test(url);
// Keeps any ?v= version on the end, so a replaced image is fetched fresh.
const thumbOf = (url: string) => url.replace(/\.jpg(\?.*)?$/, "-600.jpg$1");

export function squareImage(url: string, size: number) {
  if (isWix(url)) return `${url}/v1/fill/w_${size},h_${size},al_c,q_85,enc_auto/cover.jpg`;
  if (isBucket(url)) return size <= 720 ? thumbOf(url) : url;
  return url;
}

export function fullImage(url: string, size: number) {
  if (isWix(url)) return `${url}/v1/fit/w_${size},h_${size},q_90,enc_auto/cover.jpg`;
  return url;
}

export function squareSrcSet(url: string, sizes: number[]) {
  if (isWix(url)) return sizes.map((s) => `${squareImage(url, s)} ${s}w`).join(", ");
  if (isBucket(url)) return `${thumbOf(url)} 600w, ${url} 2000w`;
  return undefined;
}

/** Wix addresses for downloading a cover when moving it into the bucket. */
export function wixDownloads(url: string) {
  return {
    full: `${url}/v1/fit/w_2000,h_2000,q_90/cover.jpg`,
    thumb: `${url}/v1/fill/w_600,h_600,al_c,q_85/cover.jpg`,
  };
}

export { isWix };

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
