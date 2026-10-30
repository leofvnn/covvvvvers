import { getFeatured } from "@/lib/data";
import { coverCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Covvvvvers, rap album covers and the stories behind them";
// Made on request, so builds never wait on downloading cover art.
export const dynamic = "force-dynamic";

export default async function Image() {
  return coverCard(await getFeatured());
}
